import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { BookingRepository } from "src/domain/repositories/booking_repository";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { MovieRepository } from "src/domain/repositories/movie_repository";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import { UserRepository } from "src/domain/repositories/user_repository";
import { DomainEventPublisher } from "src/domain/ports/domain_event_publisher";
import { ObjectStorage } from "src/domain/ports/object_storage";
import { TicketGenerator } from "src/domain/ports/ticket_generator";
import { EmailSender, EmailResult } from "src/domain/ports/email_sender";
import { BookingID } from "src/domain/value_objects/booking_id";
import { StoragePath } from "src/domain/value_objects/storage_path";
import { TicketGeneratedEvent } from "src/domain/events/ticket_generated_event";
import { ConfirmationEmailSentEvent } from "src/domain/events/confirmation_email_sent_event";
import { ConfirmationEmailFailedEvent } from "src/domain/events/confirmation_email_failed_event";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/infrastructure/configs/app_config";

interface GenerateTicketPayload {
  bookingId: string;
  confirmedAt: string;
}

interface SendConfirmationEmailPayload {
  bookingId: string;
  invoicePath: { bucket: string; objectKey: string };
}

interface SendCancellationEmailPayload {
  bookingId: string;
  cancelledAt: string;
}

type BookingJobPayload =
  | GenerateTicketPayload
  | SendConfirmationEmailPayload
  | SendCancellationEmailPayload;

@Processor("booking-processing")
export class BookingProcessor extends WorkerHost {
  private readonly logger = new Logger(BookingProcessor.name);

  public constructor(
    @Inject(BookingRepository.name)
    private readonly bookingRepository: BookingRepository,
    @Inject(ShowtimeRepository.name)
    private readonly showtimeRepository: ShowtimeRepository,
    @Inject(MovieRepository.name)
    private readonly movieRepository: MovieRepository,
    @Inject(ScreenRepository.name)
    private readonly screenRepository: ScreenRepository,
    @Inject(UserRepository.name)
    private readonly userRepository: UserRepository,
    @Inject(DomainEventPublisher.name)
    private readonly eventPublisher: DomainEventPublisher,
    @Inject(ObjectStorage.name)
    private readonly objectStorage: ObjectStorage,
    @Inject(TicketGenerator.name)
    private readonly ticketGenerator: TicketGenerator,
    @Inject(EmailSender.name)
    private readonly emailSender: EmailSender,
    @Inject(ConfigService)
    private readonly config: ConfigService<AppConfig, true>,
  ) {
    super();
  }

  public async process(job: Job<BookingJobPayload>): Promise<void> {
    this.logger.log(`Processing job ${job.name} with ID ${job.id}`);

    switch (job.name) {
      case "generate-ticket":
        await this.handleGenerateTicket(job.data as GenerateTicketPayload);
        break;
      case "send-confirmation-email":
        await this.handleSendConfirmationEmail(
          job.data as SendConfirmationEmailPayload,
          job.attemptsMade,
        );
        break;
      case "send-cancellation-email":
        await this.handleSendCancellationEmail(
          job.data as SendCancellationEmailPayload,
        );
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleGenerateTicket(
    data: GenerateTicketPayload,
  ): Promise<void> {
    const bookingId = new BookingID(data.bookingId);
    const booking = await this.bookingRepository.bookingOfID(bookingId);

    if (booking === null) {
      this.logger.warn(
        `Booking with ID "${data.bookingId}" not found, skipping ticket generation`,
      );
      return;
    }

    if (booking.areAllTicketsIssued()) {
      this.logger.log(
        `Tickets already generated for booking "${data.bookingId}", skipping`,
      );
      return;
    }

    const showtime = await this.showtimeRepository.showtimeOfID(
      booking.showtimeId,
    );
    if (showtime === null) {
      throw new Error(`Showtime ${booking.showtimeId.value} not found`);
    }

    const [movie, screen] = await Promise.all([
      this.movieRepository.movieOfID(showtime.movieID),
      this.screenRepository.screenOfID(showtime.screenID),
    ]);

    const user = await this.userRepository.userOfID(booking.customerId);
    if (user === null) {
      throw new Error(`User ${booking.customerId.value} not found`);
    }

    const bucketName = this.config.get("MINIO_BUCKET_NAME", { infer: true });

    const qrCodePaths = new Map<string, StoragePath>();

    for (const ticket of booking.tickets) {
      const ticketCode = `TKT-${booking.id.value
        .substring(4, 8)
        .toUpperCase()}-${ticket.seatNumber}`;

      const qrCodeBuffer = await this.ticketGenerator.generateQRCode(
        ticketCode,
        {
          bookingId: booking.id.value,
          ticketCode,
          movieTitle: movie?.title ?? "Unknown",
          screenName: screen?.name ?? "Unknown",
          showtimeStart: showtime.timeSlot.timeStart,
          showtimeEnd: showtime.timeSlot.timeEnd,
          seatNumber: ticket.seatNumber,
          price: ticket.price,
          customerName: user.displayName,
          confirmedAt: booking.confirmedAt!,
        },
      );

      const qrCodePath = await this.objectStorage.upload(
        bucketName,
        `tickets/${booking.id.value}/${ticket.seatNumber}-qr.png`,
        qrCodeBuffer,
        "image/png",
      );

      qrCodePaths.set(ticket.seatNumber, qrCodePath);
    }

    booking.issueTickets(qrCodePaths);

    const invoiceBuffer = await this.ticketGenerator.generateInvoicePDF({
      bookingId: booking.id.value,
      movieTitle: movie?.title ?? "Unknown",
      screenName: screen?.name ?? "Unknown",
      showtimeStart: showtime.timeSlot.timeStart,
      showtimeEnd: showtime.timeSlot.timeEnd,
      seatNumbers: booking.seatNumbers,
      totalAmount: booking.totalAmount,
      serviceFee: booking.serviceFee,
      customerName: user.displayName,
      confirmedAt: booking.confirmedAt!,
      paymentMethod: booking.paymentDetails?.paymentMethod ?? "Unknown",
      paidAt: booking.paymentDetails?.paidAt ?? new Date(),
    });

    const invoicePath = await this.objectStorage.upload(
      bucketName,
      `tickets/${booking.id.value}/invoice.pdf`,
      invoiceBuffer,
      "application/pdf",
    );

    booking.attachInvoice(invoicePath);
    await this.bookingRepository.save(booking);

    for (const ticket of booking.tickets) {
      if (ticket.isIssued() && ticket.qrCode !== null) {
        this.eventPublisher.publish(
          new TicketGeneratedEvent(
            booking.id,
            ticket.ticketCode!,
            ticket.qrCode,
            invoicePath,
          ),
        );
      }
    }

    this.logger.log(
      `Tickets generated for booking "${data.bookingId}" (${booking.ticketCount} tickets)`,
    );
  }

  private async handleSendConfirmationEmail(
    data: SendConfirmationEmailPayload,
    attemptsMade: number,
  ): Promise<void> {
    const bookingId = new BookingID(data.bookingId);
    const booking = await this.bookingRepository.bookingOfID(bookingId);

    if (booking === null) {
      this.logger.warn(
        `Booking with ID "${data.bookingId}" not found, skipping email`,
      );
      return;
    }

    const [showtime, user] = await Promise.all([
      this.showtimeRepository.showtimeOfID(booking.showtimeId),
      this.userRepository.userOfID(booking.customerId),
    ]);

    if (showtime === null || user === null) {
      throw new Error("Required entities not found");
    }

    const movie = await this.movieRepository.movieOfID(showtime.movieID);

    const invoicePath = StoragePath.fromPersistence(data.invoicePath);

    const invoiceDownloadLink =
      await this.objectStorage.generatePresignedDownloadUrl(invoicePath, 86400);

    const issuedTicket = booking.getIssuedTickets()[0];
    let ticketDownloadLink = invoiceDownloadLink;
    if (issuedTicket !== undefined && issuedTicket.qrCode !== null) {
      ticketDownloadLink =
        await this.objectStorage.generatePresignedDownloadUrl(
          issuedTicket.qrCode,
          86400,
        );
    }

    const result = await this.emailSender.sendConfirmationEmail({
      recipientEmail: user.email,
      recipientName: user.displayName,
      bookingId: booking.id.value,
      movieTitle: movie?.title ?? "Unknown",
      showtimeDetails: `${showtime.timeSlot.timeStart.toLocaleString()}`,
      seatNumbers: booking.seatNumbers,
      totalAmount: booking.totalAmount,
      ticketDownloadLink,
      invoiceDownloadLink,
    });

    if (result.result === EmailResult.SUCCESS) {
      this.eventPublisher.publish(
        new ConfirmationEmailSentEvent(booking.id, new Date()),
      );
      this.logger.log(
        `Confirmation email sent for booking "${data.bookingId}"`,
      );
    } else {
      this.eventPublisher.publish(
        new ConfirmationEmailFailedEvent(
          booking.id,
          new Date(),
          result.error ?? "Unknown error",
          attemptsMade + 1,
        ),
      );
      throw new Error(`Failed to send email: ${result.error}`);
    }
  }

  private async handleSendCancellationEmail(
    data: SendCancellationEmailPayload,
  ): Promise<void> {
    const bookingId = new BookingID(data.bookingId);
    const booking = await this.bookingRepository.bookingOfID(bookingId);

    if (booking === null) {
      this.logger.warn(
        `Booking with ID "${data.bookingId}" not found, skipping email`,
      );
      return;
    }

    const [showtime, user] = await Promise.all([
      this.showtimeRepository.showtimeOfID(booking.showtimeId),
      this.userRepository.userOfID(booking.customerId),
    ]);

    if (user === null) {
      throw new Error("User not found");
    }

    const movie = showtime
      ? await this.movieRepository.movieOfID(showtime.movieID)
      : null;

    await this.emailSender.sendCancellationEmail({
      recipientEmail: user.email,
      recipientName: user.displayName,
      bookingId: booking.id.value,
      movieTitle: movie?.title ?? "Unknown",
    });

    this.logger.log(`Cancellation email sent for booking "${data.bookingId}"`);
  }
}
