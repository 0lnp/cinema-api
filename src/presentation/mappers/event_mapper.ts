import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import {
  ChangeEventStatusDTO,
  ChangeEventStatusResult,
  CreateEventDTO,
  CreateEventResult,
  DeleteEventResult,
  EventListItem,
  GetAllEventsResult,
  SearchFromExternalResult,
  SetEventCategoryResult,
} from "src/application/dtos/event_dto";
import {
  PatchEventIDBodyDTO,
  PatchEventIDParamsDTO,
  PostEventBodyDTO,
} from "../dtos/event_dto";
import { EventType } from "src/domain/value_objects/event_type";

export interface CreateEventResponse {
  id: string;
  title: string;
  type: string;
  created_at: string;
}

export interface ChangeStatusResponse {
  id: string;
  title: string;
}

export interface DeleteEventResponse {
  id: string;
}

export interface EventListItemResponse {
  id: string;
  type: string;
  title: string;
  description: string;
  duration: string;
  genres: string[];
  poster_url: string | null;
  certificate: string | null;
  release_year: number | null;
  status: string;
  category_id: string | null;
  created_at: string;
}

export interface GetAllEventsDataResponse {
  items: EventListItemResponse[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    total_pages: number;
  };
}

export interface SearchExternalItem {
  external_id: string;
  title: string;
  synopsis: string;
  release_year: number;
  poster_url: string;
}

export interface SearchExternalDataResponse {
  items: SearchExternalItem[];
  result_count: number;
}

export interface SetCategoryResponse {
  event_id: string;
  category_id: string | null;
}

export class EventMapper {
  public static toCreateRequest(
    dto: PostEventBodyDTO,
  ): Omit<CreateEventDTO, "createdBy"> {
    return {
      type: dto.type as EventType,
      title: dto.title,
      description: dto.description,
      durationMinutes: dto.duration_minutes,
      genres: dto.genres,
      posterPath: dto.poster_path,
      certificate: dto.certificate,
      releaseYear: dto.release_year,
    };
  }

  public static toCreateResponse(
    result: CreateEventResult,
  ): BaseSuccessfulResponse<CreateEventResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        title: result.title,
        type: result.type,
        created_at: result.createdAt.toISOString(),
      },
    };
  }

  public static toChangeStatusRequest(
    params: PatchEventIDParamsDTO,
    body: PatchEventIDBodyDTO,
  ): ChangeEventStatusDTO {
    return {
      eventID: params.event_id,
      status: body.status,
    };
  }

  public static toChangeStatusResponse(
    result: ChangeEventStatusResult,
  ): BaseSuccessfulResponse<ChangeStatusResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        title: result.title,
      },
    };
  }

  public static toDeleteResponse(
    result: DeleteEventResult,
  ): BaseSuccessfulResponse<DeleteEventResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
      },
    };
  }

  public static toGetAllResponse(
    result: GetAllEventsResult,
  ): BaseSuccessfulResponse<GetAllEventsDataResponse> {
    return {
      message: result.message,
      data: {
        items: result.items.map((item) => this.toEventListItemResponse(item)),
        pagination: {
          total: result.total,
          page: result.page,
          limit: result.limit,
          total_pages: result.totalPages,
        },
      },
    };
  }

  public static toEventListItemResponse(item: EventListItem): EventListItemResponse {
    return {
      id: item.id,
      type: item.type,
      title: item.title,
      description: item.description,
      duration: item.duration,
      genres: item.genres,
      poster_url: item.posterURL,
      certificate: item.certificate,
      release_year: item.releaseYear,
      status: item.status,
      category_id: item.categoryId,
      created_at: item.createdAt.toISOString(),
    };
  }

  public static toSearchExternalResponse(
    result: SearchFromExternalResult,
  ): BaseSuccessfulResponse<SearchExternalDataResponse> {
    return {
      message: "External search completed",
      data: {
        items: result.results.map((item) => ({
          external_id: item.externalID,
          title: item.title,
          synopsis: item.synopsis,
          release_year: item.releaseYear,
          poster_url: item.posterURL,
        })),
        result_count: result.resultCount,
      },
    };
  }

  public static toSetCategoryResponse(
    result: SetEventCategoryResult,
  ): BaseSuccessfulResponse<SetCategoryResponse> {
    return {
      message: result.message,
      data: {
        event_id: result.eventId,
        category_id: result.categoryId,
      },
    };
  }
}
