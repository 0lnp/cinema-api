import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "node:crypto";
import { createTransport, type Transporter } from "nodemailer";
import {
  EmailSender,
  ConfirmationEmailRequest,
  CancellationEmailRequest,
  EmailSendResult,
  EmailResult,
} from "src/domain/ports/email_sender";
import { AppConfig } from "../configs/app_config";

interface SmtpRequestLogContext {
  operation: string;
  params: Record<string, unknown>;
}

@Injectable()
export class SmtpEmailAdapter implements EmailSender {
  private readonly logger = new Logger(SmtpEmailAdapter.name);
  private readonly transporter: Transporter;
  private readonly fromAddress: string;
  private readonly fromName: string;

  public constructor(config: ConfigService<AppConfig, true>) {
    this.fromAddress = config.get("SMTP_FROM_ADDRESS", { infer: true });
    this.fromName = config.get("SMTP_FROM_NAME", { infer: true });

    this.transporter = createTransport({
      host: config.get("SMTP_HOST", { infer: true }),
      port: config.get("SMTP_PORT", { infer: true }),
      secure: false, // TLS
      auth: {
        user: config.get("SMTP_USER", { infer: true }),
        pass: config.get("SMTP_PASSWORD", { infer: true }),
      },
    });
  }

  public async sendConfirmationEmail(
    request: ConfirmationEmailRequest,
  ): Promise<EmailSendResult> {
    return this.executeWithLogging(
      {
        operation: "sendConfirmationEmail",
        params: {
          recipientEmail: request.recipientEmail.value,
          recipientName: request.recipientName,
          bookingId: request.bookingId,
          movieTitle: request.movieTitle,
        },
      },
      async () => {
        try {
          const html = this.buildConfirmationEmailHtml(request);

          const info = await this.transporter.sendMail({
            from: `"${this.fromName}" <${this.fromAddress}>`,
            to: request.recipientEmail.value,
            subject: `Booking Confirmation - ${request.movieTitle}`,
            html,
          });

          this.logger.debug({
            event: "SMTP_EMAIL_SENT",
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response,
          });

          return {
            result: EmailResult.SUCCESS,
            messageId: info.messageId,
          };
        } catch (error) {
          this.logger.warn({
            event: "SMTP_EMAIL_FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
            recipientEmail: request.recipientEmail.value,
          });

          return {
            result: EmailResult.FAILED,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    );
  }

  public async sendCancellationEmail(
    request: CancellationEmailRequest,
  ): Promise<EmailSendResult> {
    return this.executeWithLogging(
      {
        operation: "sendCancellationEmail",
        params: {
          recipientEmail: request.recipientEmail.value,
          recipientName: request.recipientName,
          bookingId: request.bookingId,
          movieTitle: request.movieTitle,
        },
      },
      async () => {
        try {
          const html = this.buildCancellationEmailHtml(request);

          const info = await this.transporter.sendMail({
            from: `"${this.fromName}" <${this.fromAddress}>`,
            to: request.recipientEmail.value,
            subject: `Booking Cancelled - ${request.movieTitle}`,
            html,
          });

          this.logger.debug({
            event: "SMTP_EMAIL_SENT",
            messageId: info.messageId,
            accepted: info.accepted,
            rejected: info.rejected,
            response: info.response,
          });

          return {
            result: EmailResult.SUCCESS,
            messageId: info.messageId,
          };
        } catch (error) {
          this.logger.warn({
            event: "SMTP_EMAIL_FAILED",
            error: error instanceof Error ? error.message : "Unknown error",
            recipientEmail: request.recipientEmail.value,
          });

          return {
            result: EmailResult.FAILED,
            error: error instanceof Error ? error.message : "Unknown error",
          };
        }
      },
    );
  }

  private async executeWithLogging<T>(
    context: SmtpRequestLogContext,
    operation: () => Promise<T>,
  ): Promise<T> {
    const requestId = randomUUID();
    const startTime = Date.now();

    this.logger.log({
      event: "SMTP_REQUEST_START",
      requestId,
      operation: context.operation,
      params: context.params,
      timestamp: new Date().toISOString(),
    });

    try {
      const result = await operation();
      const duration = Date.now() - startTime;

      const emailResult = result as EmailSendResult;
      this.logger.log({
        event: "SMTP_REQUEST_END",
        requestId,
        operation: context.operation,
        duration: `${duration}ms`,
        success: emailResult.result === EmailResult.SUCCESS,
        messageId: emailResult.messageId,
        timestamp: new Date().toISOString(),
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;

      this.logger.error({
        event: "SMTP_REQUEST_ERROR",
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

  private buildConfirmationEmailHtml(
    request: ConfirmationEmailRequest,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #2c3e50; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .button { display: inline-block; padding: 12px 24px; background-color: #3498db; color: white; text-decoration: none; border-radius: 5px; margin: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Dear ${request.recipientName},</p>
            <p>Your booking has been confirmed. Here are your booking details:</p>
            
            <div class="details">
              <p><strong>Booking ID:</strong> ${request.bookingId}</p>
              <p><strong>Movie:</strong> ${request.movieTitle}</p>
              <p><strong>Showtime:</strong> ${request.showtimeDetails}</p>
              <p><strong>Seats:</strong> ${request.seatNumbers.join(", ")}</p>
              <p><strong>Total Amount:</strong> ${
                request.totalAmount.currency
              } ${request.totalAmount.amount.toLocaleString()}</p>
            </div>
            
            <p>Download your ticket and invoice:</p>
            <p>
              <a href="${
                request.ticketDownloadLink.url
              }" class="button">Download QR Ticket</a>
              <a href="${
                request.invoiceDownloadLink.url
              }" class="button">Download Invoice</a>
            </p>
            
            <p><em>Note: Download links expire at ${request.ticketDownloadLink.expiresAt.toLocaleString()}</em></p>
          </div>
          <div class="footer">
            <p>Thank you for booking with us!</p>
            <p>Please present your QR code at the entrance.</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private buildCancellationEmailHtml(
    request: CancellationEmailRequest,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #e74c3c; color: white; padding: 20px; text-align: center; }
          .content { padding: 20px; background-color: #f9f9f9; }
          .details { background-color: white; padding: 15px; margin: 15px 0; border-radius: 5px; }
          .footer { text-align: center; padding: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Booking Cancelled</h1>
          </div>
          <div class="content">
            <p>Dear ${request.recipientName},</p>
            <p>Your booking has been cancelled.</p>
            
            <div class="details">
              <p><strong>Booking ID:</strong> ${request.bookingId}</p>
              <p><strong>Movie:</strong> ${request.movieTitle}</p>
            </div>
            
            <p>If you have any questions, please contact our support team.</p>
          </div>
          <div class="footer">
            <p>We hope to see you again soon!</p>
          </div>
        </div>
      </body>
      </html>
    `;
  }
}
