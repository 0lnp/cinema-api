import { EventCertificate } from "../value_objects/event_certificate";

export interface EventSearchResult {
  results: Array<{
    externalID: string;
    title: string;
    synopsis: string;
    releaseYear: number;
    posterPath: string;
  }>;
  resultCount: number;
}

export interface EventDetails {
  title: string;
  synopsis: string;
  durationMinutes: number;
  genres: string[];
  certificate: EventCertificate;
  releaseYear: number;
  posterPath: string;
}

export abstract class EventProvider {
  public static readonly name = "EventProvider";

  abstract searchEvent(keyword: string): Promise<EventSearchResult>;
  abstract getEventDetails(externalID: string): Promise<EventDetails | null>;
}
