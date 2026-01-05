import { Inject } from "@nestjs/common";
import { Event } from "../aggregates/event";
import { EventRepository } from "../repositories/event_repository";
import { UserID } from "../value_objects/user_id";
import { EventProvider } from "../ports/event_provider";

export class EventSyncService {
  public static readonly name = "EventSyncService";

  public constructor(
    @Inject(EventRepository.name)
    private readonly eventRepository: EventRepository,
    @Inject(EventProvider.name)
    private readonly eventProvider: EventProvider,
  ) {}

  public async syncMovieEvent(
    externalID: string,
    createdBy: UserID,
  ): Promise<Event | null> {
    const externalData = await this.eventProvider.getEventDetails(externalID);
    if (externalData === null) {
      return null;
    }

    const eventID = await this.eventRepository.nextIdentity();

    const event = Event.create({
      id: eventID,
      type: "MOVIE",
      title: externalData.title,
      description: externalData.synopsis,
      durationMinutes: externalData.durationMinutes,
      genres: externalData.genres,
      posterPath: externalData.posterPath,
      certificate: externalData.certificate,
      releaseYear: externalData.releaseYear,
      createdBy,
    });

    return event;
  }
}
