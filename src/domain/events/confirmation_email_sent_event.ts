import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";

export class ConfirmationEmailSentEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly sentAt: Date,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.confirmation_email_sent";
  }
}
