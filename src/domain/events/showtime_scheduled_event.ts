import { DomainEvent } from "./domain_event";
import { ShowtimeID } from "../value_objects/showtime_id";
import { EventID } from "../value_objects/event_id";
import { ScreenID } from "../value_objects/screen_id";

export class ShowtimeScheduledEvent extends DomainEvent {
  public constructor(
    public readonly showtimeID: ShowtimeID,
    public readonly eventID: EventID,
    public readonly screenID: ScreenID,
    public readonly startTime: Date,
    public readonly endTime: Date,
  ) {
    super();
  }

  public get eventName(): string {
    return "showtime.scheduled";
  }
}
