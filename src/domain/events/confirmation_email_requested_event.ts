import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";
import { UserID } from "../value_objects/user_id";
import { Email } from "../value_objects/email";
import { TicketDownloadLink } from "../value_objects/ticket_download_link";

export class ConfirmationEmailRequestedEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly userId: UserID,
    public readonly emailAddress: Email,
    public readonly ticketDownloadLink: TicketDownloadLink,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.confirmation_email_requested";
  }
}
