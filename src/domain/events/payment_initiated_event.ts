import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";
import { Money } from "../value_objects/money";

export class PaymentInitiatedEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly paymentReferenceId: string,
    public readonly paymentUrl: string,
    public readonly amount: Money,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.payment_initiated";
  }
}
