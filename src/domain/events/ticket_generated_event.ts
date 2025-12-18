import { DomainEvent } from "./domain_event";
import { BookingID } from "../value_objects/booking_id";
import { StoragePath } from "../value_objects/storage_path";

export class TicketGeneratedEvent extends DomainEvent {
  public constructor(
    public readonly bookingId: BookingID,
    public readonly ticketCode: string,
    public readonly qrCodePath: StoragePath,
    public readonly invoicePath: StoragePath,
  ) {
    super();
  }

  public get eventName(): string {
    return "booking.ticket_generated";
  }
}
