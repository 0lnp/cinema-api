import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";
import { UserID } from "../value_objects/user_id";
import { ShowtimeID } from "../value_objects/showtime_id";
import { Money } from "../value_objects/money";

export class BookingCreatedEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly customerId: UserID,
    public readonly showtimeId: ShowtimeID,
    public readonly seatNumbers: string[],
    public readonly holdExpiresAt: Date,
    public readonly totalAmount: Money,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.created";
  }
}
