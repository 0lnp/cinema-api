import { DomainEvent } from "./domain_event";
import { ShowtimeID } from "../value_objects/showtime_id";
import { MovieID } from "../value_objects/movie_id";

export class ShowtimeEndedEvent extends DomainEvent {
  public constructor(
    public readonly showtimeID: ShowtimeID,
    public readonly movieID: MovieID,
  ) {
    super();
  }

  public get eventName(): string {
    return "showtime.ended";
  }
}
