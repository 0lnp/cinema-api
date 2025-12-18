import { Money } from "../value_objects/money";

export interface TicketQRCodeDetails {
  bookingId: string;
  ticketCode: string;
  movieTitle: string;
  screenName: string;
  showtimeStart: Date;
  showtimeEnd: Date;
  seatNumber: string;
  price: Money;
  customerName: string;
  confirmedAt: Date;
}

export interface InvoiceDetails {
  bookingId: string;
  movieTitle: string;
  screenName: string;
  showtimeStart: Date;
  showtimeEnd: Date;
  seatNumbers: string[];
  totalAmount: Money;
  serviceFee: Money;
  customerName: string;
  confirmedAt: Date;
  paymentMethod: string;
  paidAt: Date;
}

export abstract class TicketGenerator {
  public abstract generateQRCode(
    ticketCode: string,
    ticketDetails: TicketQRCodeDetails,
  ): Promise<Buffer>;

  public abstract generateInvoicePDF(
    invoiceDetails: InvoiceDetails,
  ): Promise<Buffer>;
}
