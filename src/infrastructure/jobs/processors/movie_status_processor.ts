import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Inject, Logger } from "@nestjs/common";
import { Job } from "bullmq";
import { MovieRepository } from "src/domain/repositories/movie_repository";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { MovieID } from "src/domain/value_objects/movie_id";
import { MovieStatus } from "src/domain/value_objects/movie_status";

interface UpdateToNowShowingPayload {
  movieID: string;
  showtimeID: string;
}

interface CheckEndedRunPayload {
  movieID: string;
  showtimeID: string;
}

@Processor("movie-status")
export class MovieStatusProcessor extends WorkerHost {
  private readonly logger = new Logger(MovieStatusProcessor.name);

  public constructor(
    @Inject(MovieRepository.name)
    private readonly movieRepository: MovieRepository,
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
    const movieID = new MovieID(data.movieID);
    const movie = await this.movieRepository.movieOfID(movieID);

    if (movie === null) {
      this.logger.warn(
        `Movie with ID "${data.movieID}" not found, skipping status update`,
      );
      return;
    }

    if (movie.status === MovieStatus.COMING_SOON) {
      movie.changeStatus(MovieStatus.NOW_SHOWING);
      await this.movieRepository.save(movie);
      this.logger.log(
        `Updated movie with ID "${data.movieID}" status to NOW_SHOWING`,
      );
    } else {
      this.logger.log(
        `Movie with ID "${data.movieID}" is already ${movie.status}, skipping update`,
      );
    }
  }

  private async handleCheckEndedRun(data: CheckEndedRunPayload): Promise<void> {
    const movieID = new MovieID(data.movieID);
    const movie = await this.movieRepository.movieOfID(movieID);

    if (movie === null) {
      this.logger.warn(
        `Movie with ID "${data.movieID}" not found, skipping status check`,
      );
      return;
    }

    if (movie.status !== MovieStatus.NOW_SHOWING) {
      this.logger.log(
        `Movie with ID "${data.movieID}" is ${movie.status}, not NOW_SHOWING, skipping`,
      );
      return;
    }

    const upcomingShowtimes =
      await this.showtimeRepository.upcomingShowtimesOfMovie(movieID);

    if (upcomingShowtimes.length === 0) {
      movie.changeStatus(MovieStatus.ENDED_RUN);
      await this.movieRepository.save(movie);
      this.logger.log(
        `Updated movie with ID "${data.movieID}" status to ENDED_RUN`,
      );
    } else {
      this.logger.log(
        `Movie with ID "${data.movieID}" has ${upcomingShowtimes.length} upcoming showtimes, keeping NOW_SHOWING`,
      );
    }
  }
}
