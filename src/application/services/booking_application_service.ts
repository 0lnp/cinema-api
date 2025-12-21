import { Inject } from "@nestjs/common";
import { BookingRepository } from "src/domain/repositories/booking_repository";
import { SeatInventoryRepository } from "src/domain/repositories/seat_inventory_repository";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { MovieRepository } from "src/domain/repositories/movie_repository";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import { UserRepository } from "src/domain/repositories/user_repository";
import { DomainEventPublisher } from "src/domain/ports/domain_event_publisher";
import { PaymentGateway } from "src/domain/ports/payment_gateway";
import { ObjectStorage } from "src/domain/ports/object_storage";
import { Booking } from "src/domain/aggregates/booking";
import { SeatInventory } from "src/domain/aggregates/seat_inventory";
import { CurrencyCode, Money } from "src/domain/value_objects/money";
import { BookingStatus } from "src/domain/value_objects/booking_status";
import { BookingCreatedEvent } from "src/domain/events/booking_created_event";
import { PaymentInitiatedEvent } from "src/domain/events/payment_initiated_event";
import { BookingConfirmedEvent } from "src/domain/events/booking_confirmed_event";
import { BookingCancelledEvent } from "src/domain/events/booking_cancelled_event";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import {
  CancelBookingDTO,
  CancelBookingResult,
  CreateBookingDTO,
  CreateBookingResult,
  GetAllBookingsRequest,
  GetAllBookingsResult,
  GetBookingDTO,
  GetBookingResult,
  GetTicketDownloadLinkDTO,
  GetTicketDownloadLinkResult,
  GetUserBookingsRequest,
  GetUserBookingsResult,
  HandlePaymentCallbackDTO,
  HandlePaymentCallbackResult,
  InitiatePaymentDTO,
  InitiatePaymentResult,
} from "../dtos/booking_dto";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/infrastructure/configs/app_config";
import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { MovieID } from "src/domain/value_objects/movie_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { StoragePath } from "src/domain/value_objects/storage_path";

export class BookingApplicationService {
  public constructor(
    @Inject(BookingRepository.name)
    private readonly bookingRepository: BookingRepository,
    @Inject(SeatInventoryRepository.name)
    private readonly seatInventoryRepository: SeatInventoryRepository,
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
    @Inject(PaymentGateway.name)
    private readonly paymentGateway: PaymentGateway,
    @Inject(ObjectStorage.name)
    private readonly objectStorage: ObjectStorage,
    @Inject(ConfigService)
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  public async createBooking(
    dto: CreateBookingDTO,
  ): Promise<CreateBookingResult> {
    const showtime = await this.showtimeRepository.showtimeOfID(dto.showtimeId);
    if (showtime === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Showtime with ID "${dto.showtimeId.value}" not found`,
      });
    }

    if (showtime.status !== ShowtimeStatus.SCHEDULED) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SHOWTIME_NOT_AVAILABLE,
        message: "Showtime is not available for booking",
      });
    }

    if (showtime.timeSlot.timeStart.getTime() < Date.now()) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SHOWTIME_IN_PAST,
        message: "Cannot book for past showtimes",
      });
    }

    let seatInventory = await this.seatInventoryRepository.inventoryOfShowtime(
      dto.showtimeId,
    );

    if (seatInventory === null) {
      const screen = await this.screenRepository.screenOfID(showtime.screenID);
      if (screen === null) {
        throw new ApplicationError({
          code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
          message: `Screen with ID "${showtime.screenID.value}" not found`,
        });
      }

      const inventoryId = await this.seatInventoryRepository.nextIdentity();
      seatInventory = SeatInventory.create({
        id: inventoryId,
        screenId: screen.id,
        showtimeId: dto.showtimeId,
        seatNumbers: screen.seatLayout.getAllSeatNumbers(),
      });
    }

    if (!seatInventory.areSeatNumbersValid(dto.seatNumbers)) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INVALID_SEAT_SELECTION,
        message: "One or more selected seats do not exist",
      });
    }

    if (!seatInventory.areSeatNumbersAvailable(dto.seatNumbers)) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SEATS_NOT_AVAILABLE,
        message: "One or more seats are not available",
      });
    }

    const bookingId = await this.bookingRepository.nextIdentity();

    const holdUntilMs = this.config.get("SEAT_HOLD_UNTIL_MS", { infer: true });
    const holdUntil = new Date(Date.now() + holdUntilMs);

    seatInventory.holdSeats(dto.seatNumbers, bookingId, holdUntil);
    await this.seatInventoryRepository.save(seatInventory);

    const pricePerSeat = showtime.pricing;
    const ticketInfos = dto.seatNumbers.map((seatNumber) => ({
      seatNumber,
      price: pricePerSeat,
    }));

    const serviceFeeAmountIDR = this.config.get("SERVICE_FEE_AMOUNT_IDR", {
      infer: true,
    });
    const serviceFee = Money.create(serviceFeeAmountIDR, CurrencyCode.IDR);

    const booking = Booking.create({
      id: bookingId,
      customerId: dto.customerId,
      showtimeId: dto.showtimeId,
      holdExpiresAt: holdUntil,
      ticketInfos,
      serviceFee,
    });

    await this.bookingRepository.save(booking);

    this.eventPublisher.publish(
      new BookingCreatedEvent(
        booking.id,
        booking.customerId,
        booking.showtimeId,
        booking.seatNumbers,
        booking.holdExpiresAt,
        booking.totalAmount,
      ),
    );

    return {
      message: "Booking created successfully",
      bookingId: booking.id.value,
      showtimeId: booking.showtimeId.value,
      seatNumbers: booking.seatNumbers,
      ticketCount: booking.ticketCount,
      totalAmount: booking.totalAmount.amount,
      serviceFee: booking.serviceFee.amount,
      currency: booking.totalAmount.currency,
      holdExpiresAt: booking.holdExpiresAt,
      status: booking.status,
      createdAt: booking.createdAt,
    };
  }

  public async getBooking(dto: GetBookingDTO): Promise<GetBookingResult> {
    const booking = await this.bookingRepository.bookingOfID(dto.bookingId);
    if (booking === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Booking with ID "${dto.bookingId.value}" not found`,
      });
    }

    const showtime = await this.showtimeRepository.showtimeOfID(
      booking.showtimeId,
    );
    const movie = showtime
      ? await this.movieRepository.movieOfID(showtime.movieID)
      : null;
    const screen = showtime
      ? await this.screenRepository.screenOfID(showtime.screenID)
      : null;

    return {
      message: "Booking retrieved successfully",
      id: booking.id.value,
      customerId: booking.customerId.value,
      showtimeId: booking.showtimeId.value,
      movieTitle: movie?.title ?? "Unknown",
      screenName: screen?.name ?? "Unknown",
      startTime: showtime?.timeSlot.timeStart ?? new Date(),
      endTime: showtime?.timeSlot.timeEnd ?? new Date(),
      tickets: booking.tickets.map((ticket) => ({
        seatNumber: ticket.seatNumber,
        ticketCode: ticket.ticketCode,
        price: ticket.price.amount,
        status: ticket.status,
      })),
      status: booking.status,
      totalAmount: booking.totalAmount.amount,
      serviceFee: booking.serviceFee.amount,
      currency: booking.totalAmount.currency,
      paymentUrl: booking.paymentDetails?.paymentUrl ?? null,
      invoiceCode: booking.invoice?.invoiceCode ?? null,
      createdAt: booking.createdAt,
      holdExpiresAt: booking.holdExpiresAt,
      confirmedAt: booking.confirmedAt,
      checkedInAt: booking.checkedInAt,
    };
  }

  public async getUserBookings(
    dto: GetUserBookingsRequest,
  ): Promise<GetUserBookingsResult> {
    const result = await this.bookingRepository.bookingsOfUser(
      dto.userId,
      dto.query,
    );

    const showtimeIds = [
      ...new Set(result.items.map((b) => b.showtimeId.value)),
    ];
    const showtimes = await Promise.all(
      showtimeIds.map((id) =>
        this.showtimeRepository.showtimeOfID(new ShowtimeID(id)),
      ),
    );

    const movieIds = [
      ...new Set(
        showtimes.filter((s) => s !== null).map((s) => s!.movieID.value),
      ),
    ];
    const screenIds = [
      ...new Set(
        showtimes.filter((s) => s !== null).map((s) => s!.screenID.value),
      ),
    ];

    const [movies, screens] = await Promise.all([
      Promise.all(
        movieIds.map((id) => this.movieRepository.movieOfID(new MovieID(id))),
      ),
      Promise.all(
        screenIds.map((id) =>
          this.screenRepository.screenOfID(new ScreenID(id)),
        ),
      ),
    ]);

    const showtimeMap = new Map(
      showtimes.filter((s) => s !== null).map((s) => [s!.id.value, s!]),
    );
    const movieMap = new Map(
      movies.filter((m) => m !== null).map((m) => [m!.id.value, m!]),
    );
    const screenMap = new Map(
      screens.filter((s) => s !== null).map((s) => [s!.id.value, s!]),
    );

    return {
      message: "User bookings retrieved successfully",
      items: result.items.map((booking) => {
        const showtime = showtimeMap.get(booking.showtimeId.value);
        const movie = showtime
          ? movieMap.get(showtime.movieID.value)
          : undefined;
        const screen = showtime
          ? screenMap.get(showtime.screenID.value)
          : undefined;

        return {
          id: booking.id.value,
          showtimeId: booking.showtimeId.value,
          movieTitle: movie?.title ?? "Unknown",
          screenName: screen?.name ?? "Unknown",
          startTime: showtime?.timeSlot.timeStart ?? new Date(),
          seatCount: booking.ticketCount,
          status: booking.status,
          totalAmount: booking.totalAmount.amount,
          currency: booking.totalAmount.currency,
          createdAt: booking.createdAt,
        };
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  public async initiatePayment(
    dto: InitiatePaymentDTO,
  ): Promise<InitiatePaymentResult> {
    const booking = await this.bookingRepository.bookingOfID(dto.bookingId);
    if (booking === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Booking with ID "${dto.bookingId.value}" not found`,
      });
    }

    if (booking.customerId.value !== dto.customerId.value) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: "Booking not found",
      });
    }

    if (booking.isHoldExpired()) {
      throw new ApplicationError({
        code: ApplicationErrorCode.BOOKING_EXPIRED,
        message: "Booking has expired",
      });
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INVALID_BOOKING_STATE,
        message: `Cannot initiate payment for booking in ${booking.status} status`,
      });
    }

    const user = await this.userRepository.userOfID(booking.customerId);
    if (user === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: "User not found",
      });
    }

    const paymentResponse = await this.paymentGateway.createPaymentRequest({
      bookingId: booking.id,
      amount: booking.totalAmount,
      serviceFee: booking.serviceFee,
      customerEmail: user.email,
      customerName: user.displayName,
      description: `Cinema booking ${booking.id.value}`,
      successRedirectUrl: this.config.get("PAYMENT_SUCCESS_REDIRECT_URL", {
        infer: true,
      }),
      failureRedirectUrl: this.config.get("PAYMENT_FAILURE_REDIRECT_URL", {
        infer: true,
      }),
    });

    booking.initiatePayment(
      paymentResponse.paymentReferenceId,
      paymentResponse.paymentUrl,
    );
    await this.bookingRepository.save(booking);

    this.eventPublisher.publish(
      new PaymentInitiatedEvent(
        booking.id,
        paymentResponse.paymentReferenceId,
        paymentResponse.paymentUrl,
        booking.totalAmount,
      ),
    );

    return {
      message: "Payment initiated successfully",
      bookingId: booking.id.value,
      paymentUrl: paymentResponse.paymentUrl,
      expiresAt: paymentResponse.expiresAt,
    };
  }

  public async handlePaymentCallback(
    request: HandlePaymentCallbackDTO,
  ): Promise<HandlePaymentCallbackResult> {
    const booking = await this.bookingRepository.bookingOfPaymentReferenceId(
      request.paymentReferenceId,
    );

    if (booking === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Booking with payment reference "${request.paymentReferenceId}" not found`,
      });
    }

    if (request.status === "PAID" && request.paymentMethod) {
      booking.confirmPayment(request.paymentMethod);

      const seatInventory =
        await this.seatInventoryRepository.inventoryOfShowtime(
          booking.showtimeId,
        );
      if (seatInventory !== null) {
        seatInventory.reserveSeats(booking.seatNumbers, booking.id);
        await this.seatInventoryRepository.save(seatInventory);
      }

      await this.bookingRepository.save(booking);

      this.eventPublisher.publish(
        new BookingConfirmedEvent(
          booking.id,
          booking.confirmedAt!,
          booking.paymentDetails!,
        ),
      );
    } else if (request.status === "EXPIRED" || request.status === "FAILED") {
      booking.cancel();

      const seatInventory =
        await this.seatInventoryRepository.inventoryOfShowtime(
          booking.showtimeId,
        );
      if (seatInventory !== null) {
        seatInventory.releaseSeats(booking.seatNumbers, booking.id);
        await this.seatInventoryRepository.save(seatInventory);
      }

      await this.bookingRepository.save(booking);

      this.eventPublisher.publish(
        new BookingCancelledEvent(booking.id, booking.cancelledAt!),
      );
    }

    return {
      message: "Payment callback handled successfully",
      success: true,
      bookingId: booking.id.value,
      newStatus: booking.status,
    };
  }

  public async cancelBooking(
    dto: CancelBookingDTO,
  ): Promise<CancelBookingResult> {
    const booking = await this.bookingRepository.bookingOfID(dto.bookingId);
    if (booking === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Booking with ID "${dto.bookingId.value}" not found`,
      });
    }

    if (booking.customerId.value !== dto.customerId.value) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: "Booking not found",
      });
    }

    if (booking.status !== BookingStatus.PENDING_PAYMENT) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INVALID_BOOKING_STATE,
        message: "Only bookings with PENDING_PAYMENT status can be cancelled",
      });
    }

    booking.cancel();

    const seatInventory =
      await this.seatInventoryRepository.inventoryOfShowtime(
        booking.showtimeId,
      );
    if (seatInventory !== null) {
      seatInventory.releaseSeats(booking.seatNumbers, booking.id);
      await this.seatInventoryRepository.save(seatInventory);
    }

    await this.bookingRepository.save(booking);

    this.eventPublisher.publish(
      new BookingCancelledEvent(booking.id, booking.cancelledAt!),
    );

    return {
      message: "Booking cancelled successfully",
      bookingId: booking.id.value,
      cancelledAt: booking.cancelledAt!,
    };
  }

  public async getTicketDownloadLink(
    dto: GetTicketDownloadLinkDTO,
  ): Promise<GetTicketDownloadLinkResult> {
    const booking = await this.bookingRepository.bookingOfID(dto.bookingId);
    if (booking === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Booking with ID "${dto.bookingId.value}" not found`,
      });
    }

    if (booking.customerId.value !== dto.customerId.value) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: "Booking not found",
      });
    }

    let storagePath: StoragePath | undefined;

    if (dto.type === "qr_code") {
      if (!dto.seatNumber) {
        throw new ApplicationError({
          code: ApplicationErrorCode.INVALID_REQUEST,
          message: "Seat number is required for QR code download",
        });
      }

      const ticket = booking.getTicket(dto.seatNumber);
      if (ticket === undefined) {
        throw new ApplicationError({
          code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
          message: `Ticket for seat ${dto.seatNumber} not found`,
        });
      }

      if (!ticket.isIssued() && !ticket.isUsed()) {
        throw new ApplicationError({
          code: ApplicationErrorCode.TICKET_NOT_GENERATED,
          message: "Ticket has not been generated yet",
        });
      }

      if (ticket.qrCode === null) {
        throw new ApplicationError({
          code: ApplicationErrorCode.TICKET_NOT_GENERATED,
          message: "QR code has not been generated yet",
        });
      }

      storagePath = ticket.qrCode;
    } else {
      if (booking.invoice === null) {
        throw new ApplicationError({
          code: ApplicationErrorCode.TICKET_NOT_GENERATED,
          message: "Invoice has not been generated yet",
        });
      }

      storagePath = booking.invoice.invoiceStoragePath;
    }

    const downloadLink = await this.objectStorage.generatePresignedDownloadUrl(
      storagePath!,
      60 * 60, // 1 hour in seconds
    );

    return {
      message: "Download link generated successfully",
      downloadUrl: downloadLink.url,
      expiresAt: downloadLink.expiresAt,
    };
  }

  public async getAllBookings(
    dto: GetAllBookingsRequest,
  ): Promise<GetAllBookingsResult> {
    const result = await this.bookingRepository.allBookings(
      dto.query,
      dto.filters,
    );

    const showtimeIds = [
      ...new Set(result.items.map((b) => b.showtimeId.value)),
    ];
    const showtimes = await Promise.all(
      showtimeIds.map((id) =>
        this.showtimeRepository.showtimeOfID(new ShowtimeID(id)),
      ),
    );

    const movieIds = [
      ...new Set(
        showtimes.filter((s) => s !== null).map((s) => s!.movieID.value),
      ),
    ];
    const screenIds = [
      ...new Set(
        showtimes.filter((s) => s !== null).map((s) => s!.screenID.value),
      ),
    ];

    const [movies, screens] = await Promise.all([
      Promise.all(
        movieIds.map((id) => this.movieRepository.movieOfID(new MovieID(id))),
      ),
      Promise.all(
        screenIds.map((id) =>
          this.screenRepository.screenOfID(new ScreenID(id)),
        ),
      ),
    ]);

    const showtimeMap = new Map(
      showtimes.filter((s) => s !== null).map((s) => [s!.id.value, s!]),
    );
    const movieMap = new Map(
      movies.filter((m) => m !== null).map((m) => [m!.id.value, m!]),
    );
    const screenMap = new Map(
      screens.filter((s) => s !== null).map((s) => [s!.id.value, s!]),
    );

    return {
      message: "Bookings retrieved successfully",
      items: result.items.map((booking) => {
        const showtime = showtimeMap.get(booking.showtimeId.value);
        const movie = showtime
          ? movieMap.get(showtime.movieID.value)
          : undefined;
        const screen = showtime
          ? screenMap.get(showtime.screenID.value)
          : undefined;

        return {
          id: booking.id.value,
          showtimeId: booking.showtimeId.value,
          movieTitle: movie?.title ?? "Unknown",
          screenName: screen?.name ?? "Unknown",
          startTime: showtime?.timeSlot.timeStart ?? new Date(),
          seatCount: booking.ticketCount,
          status: booking.status,
          totalAmount: booking.totalAmount.amount,
          currency: booking.totalAmount.currency,
          createdAt: booking.createdAt,
        };
      }),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }
}
