import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";
import { PaymentDetails } from "../value_objects/payment_details";

export class BookingConfirmedEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly confirmedAt: Date,
    public readonly paymentDetails: PaymentDetails,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.confirmed";
  }
}
