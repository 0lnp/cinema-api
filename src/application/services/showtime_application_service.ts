import { Inject } from "@nestjs/common";
import { EventRepository } from "src/domain/repositories/event_repository";
import {
  CreateShowtimeDTO,
  CreateShowtimeResult,
  DeleteShowtimeDTO,
  DeleteShowtimeResult,
  GetAllShowtimesRequest,
  GetAllShowtimesResult,
  GetShowtimeDTO,
  GetShowtimeResult,
  UpdateShowtimeDTO,
  UpdateShowtimeResult,
} from "../dtos/showtime_dto";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { Showtime } from "src/domain/aggregates/showtime";
import { CurrencyCode, Money } from "src/domain/value_objects/money";
import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { EventID } from "src/domain/value_objects/event_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { DomainEventPublisher } from "src/domain/ports/domain_event_publisher";
import { ShowtimeScheduledEvent } from "src/domain/events/showtime_scheduled_event";
import { UnitOfWork } from "src/domain/ports/unit_of_work";

export class ShowtimeApplicationService {
  public constructor(
    @Inject(EventRepository.name)
    private readonly eventRepository: EventRepository,
    @Inject(ScreenRepository.name)
    private readonly screenRepository: ScreenRepository,
    @Inject(ShowtimeRepository.name)
    private readonly showtimeRepository: ShowtimeRepository,
    @Inject(DomainEventPublisher.name)
    private readonly eventPublisher: DomainEventPublisher,
    @Inject(UnitOfWork.name)
    private readonly unitOfWork: UnitOfWork,
  ) {}

  public async getAllShowtimes(
    request: GetAllShowtimesRequest,
  ): Promise<GetAllShowtimesResult> {
    const result = await this.showtimeRepository.allShowtimes(
      request.query,
      request.filters,
    );

    const eventIDs = [...new Set(result.items.map((s) => s.eventID.value))];
    const screenIDs = [...new Set(result.items.map((s) => s.screenID.value))];

    const [events, screens] = await Promise.all([
      Promise.all(
        eventIDs.map((id) => this.eventRepository.eventOfID(new EventID(id))),
      ),
      Promise.all(
        screenIDs.map((id) =>
          this.screenRepository.screenOfID(new ScreenID(id)),
        ),
      ),
    ]);

    const eventMap = new Map(
      events.filter((e) => e !== null).map((e) => [e!.id.value, e!]),
    );
    const screenMap = new Map(
      screens.filter((s) => s !== null).map((s) => [s!.id.value, s!]),
    );

    return {
      message: "Showtimes retrieved successfully",
      items: result.items.map((showtime) => ({
        id: showtime.id.value,
        eventID: showtime.eventID.value,
        eventTitle: eventMap.get(showtime.eventID.value)?.title ?? "Unknown",
        screenID: showtime.screenID.value,
        screenName: screenMap.get(showtime.screenID.value)?.name ?? "Unknown",
        startTime: showtime.timeSlot.timeStart,
        endTime: showtime.timeSlot.timeEnd,
        pricing: showtime.pricing.amount,
        status: showtime.status,
      })),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  public async getShowtime(
    request: GetShowtimeDTO,
  ): Promise<GetShowtimeResult> {
    const showtime = await this.showtimeRepository.showtimeOfID(request.showtimeID);
    if (showtime === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Showtime with ID "${request.showtimeID.value}" not found`,
      });
    }

    const [event, screen] = await Promise.all([
      this.eventRepository.eventOfID(showtime.eventID),
      this.screenRepository.screenOfID(showtime.screenID),
    ]);

    return {
      id: showtime.id.value,
      eventID: showtime.eventID.value,
      eventTitle: event?.title ?? "Unknown",
      screenID: showtime.screenID.value,
      screenName: screen?.name ?? "Unknown",
      startTime: showtime.timeSlot.timeStart,
      endTime: showtime.timeSlot.timeEnd,
      pricing: showtime.pricing.amount,
      status: showtime.status,
      createdAt: showtime.createdAt,
    };
  }

  public async createShowtime(
    request: CreateShowtimeDTO,
  ): Promise<CreateShowtimeResult> {
    const [event, screen, showtimeID] = await Promise.all([
      this.eventRepository.eventOfID(request.eventID),
      this.screenRepository.screenOfID(request.screenID),
      this.showtimeRepository.nextIdentity(),
    ]);
    if (event === null || screen === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: event === null ? "Event not found" : "Screen not found",
      });
    }

    const showtime = Showtime.create({
      id: showtimeID,
      eventID: event.id,
      screenID: screen.id,
      startTime: request.startTime,
      durationMinutes: event.durationMinutes,
      pricing: Money.create(request.pricing, CurrencyCode.IDR),
      createdBy: request.createdBy,
    });

    const existingShowtimes =
      await this.showtimeRepository.showtimeOfScreenAndDate(
        screen.id,
        request.startTime.toISOString().split("T")[0]!,
      );

    for (const existing of existingShowtimes) {
      if (showtime.conflictWith(existing)) {
        throw new ApplicationError({
          code: ApplicationErrorCode.SHOWTIME_CONFLICT,
          message: "Showtime conflict",
        });
      }
    }

    event.changeStatus("COMING_SOON");

    await this.unitOfWork.runInTransaction(async () => {
      await this.eventRepository.save(event);
      await this.showtimeRepository.save(showtime);
    });

    this.eventPublisher.publish(
      new ShowtimeScheduledEvent(
        showtime.id,
        showtime.eventID,
        showtime.screenID,
        showtime.timeSlot.timeStart,
        showtime.timeSlot.timeEnd,
      ),
    );

    return {
      message: "Showtime created successfully",
      id: showtime.id.value,
      screenName: screen.name,
      eventTitle: event.title,
      startTime: showtime.timeSlot.timeStart,
      endTime: showtime.timeSlot.timeEnd,
      pricing: showtime.pricing.amount,
      status: showtime.status,
      createdAt: showtime.createdAt,
    };
  }

  public async updateShowtime(
    request: UpdateShowtimeDTO,
  ): Promise<UpdateShowtimeResult> {
    if (request.pricing === undefined && request.status === undefined) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INVALID_INPUT,
        message: "At least one field (pricing or status) must be provided",
      });
    }

    const showtime = await this.showtimeRepository.showtimeOfID(request.showtimeID);
    if (showtime === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Showtime with ID "${request.showtimeID.value}" not found`,
      });
    }

    if (request.pricing !== undefined) {
      showtime.updatePricing(Money.create(request.pricing, CurrencyCode.IDR));
    }

    if (request.status !== undefined) {
      switch (request.status) {
        case ShowtimeStatus.CANCELLED:
          showtime.cancel();
          break;
        case ShowtimeStatus.COMPLETED:
          showtime.complete();
          break;
      }
    }

    await this.showtimeRepository.save(showtime);

    return {
      message: "Showtime updated successfully",
      id: showtime.id.value,
      pricing: showtime.pricing.amount,
      status: showtime.status,
    };
  }

  public async deleteShowtime(
    request: DeleteShowtimeDTO,
  ): Promise<DeleteShowtimeResult> {
    const showtime = await this.showtimeRepository.showtimeOfID(request.showtimeID);
    if (showtime === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Showtime with ID "${request.showtimeID.value}" not found`,
      });
    }

    showtime.softDelete(request.deletedBy);

    await this.showtimeRepository.save(showtime);

    return {
      message: "Showtime deleted successfully",
      id: showtime.id.value,
    };
  }
}
