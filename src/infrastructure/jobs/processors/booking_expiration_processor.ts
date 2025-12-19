import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { BookingRepository } from "src/domain/repositories/booking_repository";
import { SeatInventoryRepository } from "src/domain/repositories/seat_inventory_repository";
import { DomainEventPublisher } from "src/domain/ports/domain_event_publisher";
import { BookingExpiredEvent } from "src/domain/events/booking_expired_event";

@Processor("booking-expiration")
export class BookingExpirationProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingExpirationProcessor.name);

  public constructor(
    @Inject(BookingRepository.name)
    private readonly bookingRepository: BookingRepository,
    @Inject(SeatInventoryRepository.name)
    private readonly seatInventoryRepository: SeatInventoryRepository,
    @Inject(DomainEventPublisher.name)
    private readonly eventPublisher: DomainEventPublisher,
  ) {
    super();
  }

  public async process(job: Job): Promise<void> {
    this.logger.log(`Processing booking expiration check job ${job.id}`);

    switch (job.name) {
      case "check-expired-bookings":
        await this.handleCheckExpiredBookings();
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleCheckExpiredBookings(): Promise<void> {
    const now = new Date();
    const expiredBookings = await this.bookingRepository.pendingExpiredBefore(
      now,
    );

    this.logger.log(`Found ${expiredBookings.length} expired bookings`);

    for (const booking of expiredBookings) {
      try {
        const seatInventory =
          await this.seatInventoryRepository.inventoryOfShowtime(
            booking.showtimeId,
          );
        if (seatInventory !== null) {
          seatInventory.releaseSeats(booking.seatNumbers, booking.id);
          await this.seatInventoryRepository.save(seatInventory);
        }

        booking.expire();
        await this.bookingRepository.save(booking);

        this.eventPublisher.publish(new BookingExpiredEvent(booking.id, now));

        this.logger.log(`Expired booking ${booking.id.value}`);
      } catch (error) {
        this.logger.error(
          `Failed to expire booking ${booking.id.value}: ${error}`,
        );
      }
    }
  }
}
