import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { EventRepository } from "src/domain/repositories/event_repository";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { EventID } from "src/domain/value_objects/event_id";

interface UpdateToNowShowingPayload {
  eventID: string;
  showtimeID: string;
}

interface CheckEndedRunPayload {
  eventID: string;
  showtimeID: string;
}

@Processor("event-status")
export class EventStatusProcessor extends WorkerHost {
  private readonly logger = new Logger(EventStatusProcessor.name);

  public constructor(
    @Inject(EventRepository.name)
    private readonly eventRepository: EventRepository,
    @Inject(ShowtimeRepository.name)
    private readonly showtimeRepository: ShowtimeRepository,
  ) {
    super();
  }

  public async process(
    job: Job<UpdateToNowShowingPayload | CheckEndedRunPayload>,
  ): Promise<void> {
    this.logger.log(`Processing job ${job.name} with ID ${job.id}`);

    switch (job.name) {
      case "update-to-now-showing":
        await this.handleUpdateToNowShowing(
          job.data as UpdateToNowShowingPayload,
        );
        break;
      case "check-ended-run":
        await this.handleCheckEndedRun(job.data as CheckEndedRunPayload);
        break;
      default:
        this.logger.warn(`Unknown job name: ${job.name}`);
    }
  }

  private async handleUpdateToNowShowing(
    data: UpdateToNowShowingPayload,
  ): Promise<void> {
    const eventID = new EventID(data.eventID);
    const event = await this.eventRepository.eventOfID(eventID);

    if (event === null) {
      this.logger.warn(
        `Event with ID "${data.eventID}" not found, skipping status update`,
      );
      return;
    }

    if (event.status === "COMING_SOON") {
      event.changeStatus("NOW_SHOWING");
      await this.eventRepository.save(event);
      this.logger.log(
        `Updated event with ID "${data.eventID}" status to NOW_SHOWING`,
      );
    } else {
      this.logger.log(
        `Event with ID "${data.eventID}" is already ${event.status}, skipping update`,
      );
    }
  }

  private async handleCheckEndedRun(data: CheckEndedRunPayload): Promise<void> {
    const eventID = new EventID(data.eventID);
    const event = await this.eventRepository.eventOfID(eventID);

    if (event === null) {
      this.logger.warn(
        `Event with ID "${data.eventID}" not found, skipping status check`,
      );
      return;
    }

    if (event.status !== "NOW_SHOWING") {
      this.logger.log(
        `Event with ID "${data.eventID}" is ${event.status}, not NOW_SHOWING, skipping`,
      );
      return;
    }

    const upcomingShowtimes =
      await this.showtimeRepository.upcomingShowtimesOfEvent(eventID);

    if (upcomingShowtimes.length === 0) {
      event.changeStatus("ENDED");
      await this.eventRepository.save(event);
      this.logger.log(
        `Updated event with ID "${data.eventID}" status to ENDED`,
      );
    } else {
      this.logger.log(
        `Event with ID "${data.eventID}" has ${upcomingShowtimes.length} upcoming showtimes, keeping NOW_SHOWING`,
      );
    }
  }
}
