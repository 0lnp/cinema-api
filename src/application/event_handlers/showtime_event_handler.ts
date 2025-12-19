import { Injectable } from "@nestjs/common";
import { OnEvent } from "@nestjs/event-emitter";
import { InjectQueue } from "@nestjs/bullmq";
import { Queue } from "bullmq";
import { ShowtimeScheduledEvent } from "src/domain/events/showtime_scheduled_event";

@Injectable()
export class ShowtimeEventHandler {
  public constructor(
    @InjectQueue("movie-status")
    private readonly movieStatusQueue: Queue,
  ) {}

  @OnEvent("showtime.scheduled")
  public async handleShowtimeScheduled(
    event: ShowtimeScheduledEvent,
  ): Promise<void> {
    const now = new Date();

    const startDelay = event.startTime.getTime() - now.getTime();

    if (startDelay > 0) {
      await this.movieStatusQueue.add(
        "update-to-now-showing",
        {
          movieID: event.movieID.value,
          showtimeID: event.showtimeID.value,
        },
        {
          delay: startDelay,
          jobId: `showtime-start-${event.showtimeID.value}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }

    const endDelay = event.endTime.getTime() - now.getTime();

    if (endDelay > 0) {
      await this.movieStatusQueue.add(
        "check-ended-run",
        {
          movieID: event.movieID.value,
          showtimeID: event.showtimeID.value,
        },
        {
          delay: endDelay,
          jobId: `showtime-end-${event.showtimeID.value}`,
          removeOnComplete: true,
          removeOnFail: false,
        },
      );
    }
  }
}
