import { EventCertificate } from "src/domain/value_objects/event_certificate";
import { EventID } from "src/domain/value_objects/event_id";
import { EventStatus } from "src/domain/value_objects/event_status";
import { EventType } from "src/domain/value_objects/event_type";
import { UserID } from "src/domain/value_objects/user_id";
import { CategoryID } from "src/domain/value_objects/category_id";
import { EventSortField } from "src/domain/repositories/event_repository";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export interface CreateEventDTO {
  createdBy: UserID;
  type: EventType;
  title: string;
  description: string;
  durationMinutes: number;
  genres: string[];
  posterPath: string | null;
  certificate: EventCertificate | null;
  releaseYear: number | null;
}

export interface CreateEventResult {
  message: string;
  id: string;
  title: string;
  type: EventType;
  createdAt: Date;
}

export interface CreateFromExternalDTO {
  createdBy: UserID;
  externalID: string;
}

export interface SearchFromExternalResult {
  results: Array<{
    externalID: string;
    title: string;
    synopsis: string;
    releaseYear: number;
    posterURL: string;
  }>;
  resultCount: number;
}

export interface SearchFromExternalDTO {
  keyword: string;
}

export interface ChangeEventStatusDTO {
  eventID: EventID;
  status: EventStatus;
}

export interface ChangeEventStatusResult {
  message: string;
  id: string;
  title: string;
}

export interface DeleteEventDTO {
  deletedBy: UserID;
  eventID: EventID;
}

export interface DeleteEventResult {
  message: string;
  id: string;
}

export interface GetAllEventsDTO {
  status?: EventStatus;
  genre?: string;
  releaseYear?: number;
}

export interface GetAllEventsRequest {
  query: PaginatedQuery<EventSortField>;
  filters?: {
    status?: EventStatus;
    genre?: string;
    releaseYear?: number;
  };
}

export interface EventListItem {
  id: string;
  type: EventType;
  title: string;
  description: string;
  duration: string;
  genres: string[];
  posterURL: string | null;
  certificate: string | null;
  releaseYear: number | null;
  status: EventStatus;
  categoryId: string | null;
  createdAt: Date;
}

export type GetAllEventsResult = PaginatedResult<EventListItem> & {
  message: string;
};

export interface SetEventCategoryDTO {
  eventID: EventID;
  categoryID: CategoryID | null;
}

export interface SetEventCategoryResult {
  message: string;
  eventId: string;
  categoryId: string | null;
}
