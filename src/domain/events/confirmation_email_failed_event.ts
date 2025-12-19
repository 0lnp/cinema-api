import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";

export class ConfirmationEmailFailedEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly failedAt: Date,
    public readonly reason: string,
    public readonly retryCount: number,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.confirmation_email_failed";
  }
}
