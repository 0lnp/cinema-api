import { Email } from "../value_objects/email";
import { Money } from "../value_objects/money";
import { TicketDownloadLink } from "../value_objects/ticket_download_link";

export interface ConfirmationEmailRequest {
  recipientEmail: Email;
  recipientName: string;
  bookingId: string;
  movieTitle: string;
  showtimeDetails: string;
  seatNumbers: string[];
  totalAmount: Money;
  ticketDownloadLink: TicketDownloadLink;
  invoiceDownloadLink: TicketDownloadLink;
}

export interface CancellationEmailRequest {
  recipientEmail: Email;
  recipientName: string;
  bookingId: string;
  movieTitle: string;
}

export enum EmailResult {
  SUCCESS = "SUCCESS",
  FAILED = "FAILED",
}

export interface EmailSendResult {
  result: EmailResult;
  messageId?: string;
  error?: string;
}

export abstract class EmailSender {
  public abstract sendConfirmationEmail(
    request: ConfirmationEmailRequest,
  ): Promise<EmailSendResult>;

  public abstract sendCancellationEmail(
    request: CancellationEmailRequest,
  ): Promise<EmailSendResult>;
}
