import { DomainEvent } from "./domain_event";
import { ShowtimeID } from "../value_objects/showtime_id";
import { EventID } from "../value_objects/event_id";

export class ShowtimeEndedEvent extends DomainEvent {
  public constructor(
    public readonly showtimeID: ShowtimeID,
    public readonly eventID: EventID,
  ) {
    super();
  }

  public get eventName(): string {
    return "showtime.ended";
  }
}
