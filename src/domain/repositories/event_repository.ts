import { Event } from "../aggregates/event";
import { EventID } from "../value_objects/event_id";
import { EventStatus } from "../value_objects/event_status";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export const EventSortField = [
  "title",
  "releaseYear",
  "createdAt",
  "durationMinutes",
] as const;
export type EventSortField = (typeof EventSortField)[number];

export interface EventSearchFilters {
  status?: EventStatus;
  genre?: string;
  releaseYear?: number;
}

export abstract class EventRepository {
  abstract nextIdentity(): Promise<EventID>;
  abstract eventOfID(id: EventID): Promise<Event | null>;
  abstract allEvents(
    query: PaginatedQuery<EventSortField>,
    filters?: EventSearchFilters,
  ): Promise<PaginatedResult<Event>>;
  abstract save(event: Event): Promise<void>;
}
