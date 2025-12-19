import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";

export class BookingCancelledEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly cancelledAt: Date,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.cancelled";
  }
}
