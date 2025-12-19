import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { BookingConfirmedEvent } from "src/domain/events/booking_confirmed_event";
import { BookingCancelledEvent } from "src/domain/events/booking_cancelled_event";
import { BookingExpiredEvent } from "src/domain/events/booking_expired_event";
import { TicketGeneratedEvent } from "src/domain/events/ticket_generated_event";

@Injectable()
export class BookingEventHandler {
  public constructor(
    @InjectQueue("booking-processing")
    private readonly bookingQueue: Queue,
  ) {}

  @OnEvent("booking.confirmed")
  public async handleBookingConfirmed(
    event: BookingConfirmedEvent,
  ): Promise<void> {
    await this.bookingQueue.add(
      "generate-ticket",
      {
        bookingId: event.bookingId.value,
        confirmedAt: event.confirmedAt.toISOString(),
      },
      {
        jobId: `ticket-gen-${event.bookingId.value}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    );
  }

  @OnEvent("booking.ticket_generated")
  public async handleTicketGenerated(
    event: TicketGeneratedEvent,
  ): Promise<void> {
    await this.bookingQueue.add(
      "send-confirmation-email",
      {
        bookingId: event.bookingId.value,
        invoicePath: {
          bucket: event.invoicePath.bucket,
          objectKey: event.invoicePath.objectKey,
        },
      },
      {
        jobId: `email-${event.bookingId.value}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 5,
        backoff: {
          type: "exponential",
          delay: 10000,
        },
      },
    );
  }

  @OnEvent("booking.cancelled")
  public async handleBookingCancelled(
    event: BookingCancelledEvent,
  ): Promise<void> {
    await this.bookingQueue.add(
      "send-cancellation-email",
      {
        bookingId: event.bookingId.value,
        cancelledAt: event.cancelledAt.toISOString(),
      },
      {
        jobId: `cancel-email-${event.bookingId.value}`,
        removeOnComplete: true,
        removeOnFail: false,
        attempts: 3,
        backoff: {
          type: "exponential",
          delay: 5000,
        },
      },
    );
  }

  @OnEvent("booking.expired")
  public async handleBookingExpired(event: BookingExpiredEvent): Promise<void> {
    console.log(
      `Booking ${
        event.bookingId.value
      } expired at ${event.expiredAt.toISOString()}`,
    );
  }
}
