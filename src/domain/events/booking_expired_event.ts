import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";

export class BookingExpiredEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly expiredAt: Date,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.expired";
  }
}
