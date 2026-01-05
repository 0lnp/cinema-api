import {
  ChangeEventStatusDTO,
  ChangeEventStatusResult,
  CreateEventDTO,
  CreateEventResult,
  CreateFromExternalDTO,
  DeleteEventDTO,
  DeleteEventResult,
  EventListItem,
  GetAllEventsRequest,
  GetAllEventsResult,
  SearchFromExternalDTO,
  SearchFromExternalResult,
  SetEventCategoryDTO,
  SetEventCategoryResult,
} from "../dtos/event_dto";
import { EventRepository } from "src/domain/repositories/event_repository";
import { CategoryRepository } from "src/domain/repositories/category_repository";
import { Inject } from "@nestjs/common";
import { Event } from "src/domain/aggregates/event";
import { EventSyncService } from "src/domain/services/event_sync_service";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { EventProvider } from "src/domain/ports/event_provider";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/infrastructure/configs/app_config";
import { formatDuration } from "src/shared/utilities/format_duration";

export class EventApplicationService {
  public constructor(
    @Inject(EventRepository.name)
    private readonly eventRepository: EventRepository,
    @Inject(CategoryRepository.name)
    private readonly categoryRepository: CategoryRepository,
    @Inject(EventSyncService.name)
    private readonly eventSyncService: EventSyncService,
    @Inject(EventProvider.name)
    private readonly eventProvider: EventProvider,
    @Inject(ConfigService)
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  public async getAllEvents(
    request: GetAllEventsRequest,
  ): Promise<GetAllEventsResult> {
    const result = await this.eventRepository.allEvents(
      request.query,
      request.filters,
    );

    return {
      message: "Events retrieved successfully",
      items: result.items.map((event) => this.mapToEventListItem(event)),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  public async create(request: CreateEventDTO): Promise<CreateEventResult> {
    const eventID = await this.eventRepository.nextIdentity();

    const event = Event.create({
      id: eventID,
      type: request.type,
      title: request.title,
      description: request.description,
      durationMinutes: request.durationMinutes,
      genres: request.genres,
      posterPath: request.posterPath,
      certificate: request.certificate,
      releaseYear: request.releaseYear,
      createdBy: request.createdBy,
    });

    await this.eventRepository.save(event);

    return {
      message: "Event created successfully",
      id: event.id.value,
      title: event.title,
      type: event.type,
      createdAt: event.createdAt,
    };
  }

  public async searchFromExternal(
    request: SearchFromExternalDTO,
  ): Promise<SearchFromExternalResult> {
    const searchResult = await this.eventProvider.searchEvent(request.keyword);

    return {
      results: searchResult.results.map((event) => ({
        ...event,
        posterURL:
          this.config.get("MOVIE_POSTER_BASE_URL", { infer: true }) +
          event.posterPath,
      })),
      resultCount: searchResult.resultCount,
    };
  }

  public async createFromExternal(
    request: CreateFromExternalDTO,
  ): Promise<CreateEventResult> {
    const event = await this.eventSyncService.syncMovieEvent(
      request.externalID,
      request.createdBy,
    );
    if (event === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Movie with external ID "${request.externalID}" not found"`,
      });
    }

    await this.eventRepository.save(event);

    return {
      message: "Movie event created successfully",
      id: event.id.value,
      title: event.title,
      type: event.type,
      createdAt: event.createdAt,
    };
  }

  public async changeStatus(
    request: ChangeEventStatusDTO,
  ): Promise<ChangeEventStatusResult> {
    const event = await this.eventRepository.eventOfID(request.eventID);
    if (event === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Event with ID "${request.eventID.value}" not found`,
      });
    }

    event.changeStatus(request.status);
    await this.eventRepository.save(event);

    return {
      message: "Event status updated successfully",
      id: event.id.value,
      title: event.title,
    };
  }

  public async deleteEvent(
    request: DeleteEventDTO,
  ): Promise<DeleteEventResult> {
    const event = await this.eventRepository.eventOfID(request.eventID);
    if (event === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Event with ID "${request.eventID.value}" not found`,
      });
    }

    event.softDelete(request.deletedBy);
    await this.eventRepository.save(event);

    return {
      message: "Event deleted successfully",
      id: event.id.value,
    };
  }

  public async setEventCategory(
    request: SetEventCategoryDTO,
  ): Promise<SetEventCategoryResult> {
    const event = await this.eventRepository.eventOfID(request.eventID);
    if (event === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Event with ID "${request.eventID.value}" not found`,
      });
    }

    if (request.categoryID !== null) {
      const category = await this.categoryRepository.categoryOfID(
        request.categoryID,
      );
      if (category === null) {
        throw new ApplicationError({
          code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
          message: `Category with ID "${request.categoryID.value}" not found`,
        });
      }
    }

    event.setCategory(request.categoryID);
    await this.eventRepository.save(event);

    return {
      message:
        request.categoryID !== null
          ? "Event category updated successfully"
          : "Event category removed successfully",
      eventId: event.id.value,
      categoryId: request.categoryID?.value ?? null,
    };
  }

  private mapToEventListItem(event: Event): EventListItem {
    const posterURL = event.posterPath
      ? this.config.get("MOVIE_POSTER_BASE_URL", { infer: true }) + event.posterPath
      : null;

    return {
      id: event.id.value,
      type: event.type,
      title: event.title,
      description: event.description,
      duration: formatDuration(event.durationMinutes),
      genres: event.genres,
      posterURL,
      certificate: event.certificate,
      releaseYear: event.releaseYear,
      status: event.status,
      categoryId: event.categoryId?.value ?? null,
      createdAt: event.createdAt,
    };
  }
}
