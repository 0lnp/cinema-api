import { Injectable, Logger } from "@nestjs/common";
import { randomUUID } from "node:crypto";
import * as QRCode from "qrcode";
import * as PDFDocument from "pdfkit";
import {
  TicketGenerator,
  TicketQRCodeDetails,
  InvoiceDetails,
} from "src/domain/ports/ticket_generator";

interface PdfGeneratorLogContext {
  operation: string;
  params: Record<string, unknown>;
}

@Injectable()
export class PdfTicketGeneratorAdapter implements TicketGenerator {
  private readonly logger = new Logger(PdfTicketGeneratorAdapter.name);

  public async generateQRCode(
    ticketCode: string,
    ticketDetails: TicketQRCodeDetails,
  ): Promise<Buffer> {
    return this.executeWithLogging(
      {
        operation: "generateQRCode",
        params: {
          ticketCode,
          bookingId: ticketDetails.bookingId,
          movieTitle: ticketDetails.movieTitle,
          seatNumber: ticketDetails.seatNumber,
        },
      },
      async () => {
        const qrData = JSON.stringify({
          ticketCode,
          bookingId: ticketDetails.bookingId,
          movieTitle: ticketDetails.movieTitle,
          showtimeStart: ticketDetails.showtimeStart.toISOString(),
          seatNumber: ticketDetails.seatNumber,
          price: ticketDetails.price.amount,
        });

        const qrBuffer = await QRCode.toBuffer(qrData, {
          type: "png",
          width: 300,
          margin: 2,
          color: {
            dark: "#000000",
            light: "#ffffff",
          },
        });

        this.logger.debug({
          event: "PDF_QR_CODE_GENERATED",
          ticketCode,
          qrDataSize: qrData.length,
          bufferSize: qrBuffer.length,
        });

        return qrBuffer;
      },
    );
  }

  public async generateInvoicePDF(
    invoiceDetails: InvoiceDetails,
  ): Promise<Buffer> {
    return this.executeWithLogging(
      {
        operation: "generateInvoicePDF",
        params: {
          bookingId: invoiceDetails.bookingId,
          movieTitle: invoiceDetails.movieTitle,
          customerName: invoiceDetails.customerName,
          seatCount: invoiceDetails.seatNumbers.length,
          totalAmount: invoiceDetails.totalAmount.amount,
          currency: invoiceDetails.totalAmount.currency,
        },
      },
      async () => {
        return new Promise((resolve, reject) => {
          const doc = new PDFDocument({ size: "A4", margin: 50 });
          const chunks: Buffer[] = [];

          doc.on("data", (chunk: Buffer) => chunks.push(chunk));
          doc.on("end", () => {
            const buffer = Buffer.concat(chunks);
            this.logger.debug({
              event: "PDF_INVOICE_GENERATED",
              bookingId: invoiceDetails.bookingId,
              pdfSize: buffer.length,
            });
            resolve(buffer);
          });
          doc.on("error", reject);

          doc
            .fontSize(24)
            .font("Helvetica-Bold")
            .text("Cinema Booking Invoice", { align: "center" });
          doc.moveDown();

          doc.fontSize(12).font("Helvetica");
          doc.text(`Invoice Date: ${new Date().toLocaleDateString()}`);
          doc.text(`Booking ID: ${invoiceDetails.bookingId}`);
          doc.moveDown();

          doc
            .strokeColor("#cccccc")
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke();
          doc.moveDown();

          doc.fontSize(14).font("Helvetica-Bold").text("Movie Details");
          doc.fontSize(12).font("Helvetica");
          doc.text(`Movie: ${invoiceDetails.movieTitle}`);
          doc.text(`Screen: ${invoiceDetails.screenName}`);
          doc.text(
            `Showtime: ${invoiceDetails.showtimeStart.toLocaleString()} - ${invoiceDetails.showtimeEnd.toLocaleString()}`,
          );
          doc.text(`Seats: ${invoiceDetails.seatNumbers.join(", ")}`);
          doc.moveDown();

          doc.fontSize(14).font("Helvetica-Bold").text("Customer Details");
          doc.fontSize(12).font("Helvetica");
          doc.text(`Name: ${invoiceDetails.customerName}`);
          doc.moveDown();

          doc.fontSize(14).font("Helvetica-Bold").text("Payment Details");
          doc.fontSize(12).font("Helvetica");
          doc.text(`Payment Method: ${invoiceDetails.paymentMethod}`);
          doc.text(`Paid At: ${invoiceDetails.paidAt.toLocaleString()}`);
          doc.text(
            `Confirmed At: ${invoiceDetails.confirmedAt.toLocaleString()}`,
          );
          doc.moveDown();

          doc
            .strokeColor("#cccccc")
            .lineWidth(1)
            .moveTo(50, doc.y)
            .lineTo(545, doc.y)
            .stroke();
          doc.moveDown();

          doc.fontSize(12).font("Helvetica");
          const ticketSubtotal =
            invoiceDetails.totalAmount.amount -
            invoiceDetails.serviceFee.amount;
          doc.text(
            `Subtotal: ${
              invoiceDetails.totalAmount.currency
            } ${ticketSubtotal.toLocaleString()}`,
            { align: "right" },
          );
          doc.text(
            `Service Fee: ${
              invoiceDetails.serviceFee.currency
            } ${invoiceDetails.serviceFee.amount.toLocaleString()}`,
            { align: "right" },
          );
          doc.moveDown(0.5);
          doc
            .fontSize(16)
            .font("Helvetica-Bold")
            .text(
              `Total Amount: ${
                invoiceDetails.totalAmount.currency
              } ${invoiceDetails.totalAmount.amount.toLocaleString()}`,
              { align: "right" },
            );
          doc.moveDown(2);

          doc
            .fontSize(10)
            .font("Helvetica")
            .fillColor("#666666")
            .text("Thank you for your booking!", { align: "center" });
          doc.text(
            "Please present this invoice or your QR code at the entrance.",
            {
              align: "center",
            },
          );

          doc.end();
        });
      },
    );
  }

  private async executeWithLogging<T>(
    context: PdfGeneratorLogContext,
    operation: () => Promise<T>,
  ): Promise<T> {
    const requestId = randomUUID();
    const startTime = Date.now();

    this.logger.log({
      event: "PDF_GENERATOR_REQUEST_START",
      requestId,
      operation: context.operation,
      params: context.params,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      this.logger.log({
        event: "PDF_GENERATOR_REQUEST_END",
        requestId,
        operation: context.operation,
        duration: `${duration}ms`,
        success: true,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error({
        event: "PDF_GENERATOR_REQUEST_ERROR",
        requestId,
        operation: context.operation,
        params: context.params,
        duration: `${duration}ms`,
        error: error instanceof Error ? error.message : "Unknown error",
        errorStack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString(),
      });

      throw error;
    }
  }
}
