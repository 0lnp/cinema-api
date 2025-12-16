import { Inject } from "@nestjs/common";
import { MovieRepository } from "src/domain/repositories/movie_repository";
import {
  CreateShowtimeDTO,
  CreateShowtimeDTOSchema,
  CreateShowtimeResult,
  DeleteShowtimeDTO,
  DeleteShowtimeDTOSchema,
  DeleteShowtimeResult,
  GetAllShowtimesDTO,
  GetAllShowtimesDTOSchema,
  GetAllShowtimesResult,
  GetShowtimeDTO,
  GetShowtimeDTOSchema,
  GetShowtimeResult,
  UpdateShowtimeDTO,
  UpdateShowtimeDTOSchema,
  UpdateShowtimeResult,
} from "../dtos/showtime_dto";
import { validate } from "src/shared/utilities/validation";
import { ScreenRepository } from "src/domain/repositories/screen_repository";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { Showtime } from "src/domain/aggregates/showtime";
import { CurrencyCode, Money } from "src/domain/value_objects/money";
import { ReplaceFields } from "src/shared/types/replace_fields";
import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { MovieID } from "src/domain/value_objects/movie_id";
import { ScreenID } from "src/domain/value_objects/screen_id";

export class ShowtimeApplicationService {
  public constructor(
    @Inject(MovieRepository.name)
    private readonly movieRepository: MovieRepository,
    @Inject(ScreenRepository.name)
    private readonly screenRepository: ScreenRepository,
    @Inject(ShowtimeRepository.name)
    private readonly showtimeRepository: ShowtimeRepository,
  ) {}

  public async getAllShowtimes(
    request: ReplaceFields<
      GetAllShowtimesDTO,
      { screenID?: string; date?: string }
    >,
  ): Promise<GetAllShowtimesResult> {
    const dto = validate(GetAllShowtimesDTOSchema, request);

    const showtimes = await this.showtimeRepository.allShowtimes({
      screenID: dto.screenID,
      date: dto.date,
    });

    const movieIDs = [...new Set(showtimes.map((s) => s.movieID.value))];
    const screenIDs = [...new Set(showtimes.map((s) => s.screenID.value))];

    const [movies, screens] = await Promise.all([
      Promise.all(
        movieIDs.map((id) => this.movieRepository.movieOfID(new MovieID(id))),
      ),
      Promise.all(
        screenIDs.map((id) =>
          this.screenRepository.screenOfID(new ScreenID(id)),
        ),
      ),
    ]);

    const movieMap = new Map(
      movies.filter((m) => m !== null).map((m) => [m!.id.value, m!]),
    );
    const screenMap = new Map(
      screens.filter((s) => s !== null).map((s) => [s!.id.value, s!]),
    );

    return {
      showtimes: showtimes.map((showtime) => ({
        id: showtime.id.value,
        movieID: showtime.movieID.value,
        movieTitle: movieMap.get(showtime.movieID.value)?.title ?? "Unknown",
        screenID: showtime.screenID.value,
        screenName: screenMap.get(showtime.screenID.value)?.name ?? "Unknown",
        startTime: showtime.timeSlot.timeStart,
        endTime: showtime.timeSlot.timeEnd,
        pricing: showtime.pricing.amount,
        status: showtime.status,
      })),
      resultCount: showtimes.length,
    };
  }

  public async getShowtime(
    request: ReplaceFields<GetShowtimeDTO, { showtimeID: string }>,
  ): Promise<GetShowtimeResult> {
    const dto = validate(GetShowtimeDTOSchema, request);

    const showtime = await this.showtimeRepository.showtimeOfID(dto.showtimeID);
    if (showtime === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SHOWTIME_NOT_FOUND,
        message: `Showtime with ID "${dto.showtimeID.value}" not found`,
      });
    }

    const [movie, screen] = await Promise.all([
      this.movieRepository.movieOfID(showtime.movieID),
      this.screenRepository.screenOfID(showtime.screenID),
    ]);

    return {
      id: showtime.id.value,
      movieID: showtime.movieID.value,
      movieTitle: movie?.title ?? "Unknown",
      screenID: showtime.screenID.value,
      screenName: screen?.name ?? "Unknown",
      startTime: showtime.timeSlot.timeStart,
      endTime: showtime.timeSlot.timeEnd,
      pricing: showtime.pricing.amount,
      status: showtime.status,
      createdAt: showtime.createdAt,
    };
  }

  public async createShowtime(
    request: ReplaceFields<
      CreateShowtimeDTO,
      { movieID: string; screenID: string }
    >,
  ): Promise<CreateShowtimeResult> {
    const dto = validate(CreateShowtimeDTOSchema, request);

    const [movie, screen, showtimeID] = await Promise.all([
      this.movieRepository.movieOfID(dto.movieID),
      this.screenRepository.screenOfID(dto.screenID),
      this.showtimeRepository.nextIdentity(),
    ]);
    if (movie === null || screen === null) {
      throw new ApplicationError({
        code:
          movie === null
            ? ApplicationErrorCode.MOVIE_NOT_FOUND
            : ApplicationErrorCode.SCREEN_NOT_FOUND,
        message: movie === null ? "Movie not found" : "Screen not found",
      });
    }

    const showtime = Showtime.create({
      id: showtimeID,
      movieID: movie.id,
      screenID: screen.id,
      startTime: dto.startTime,
      durationMinutes: movie.durationMinutes,
      pricing: Money.create(dto.pricing, CurrencyCode.IDR),
      createdBy: dto.createdBy,
    });

    const existingShowtimes =
      await this.showtimeRepository.showtimeOfScreenAndDate(
        screen.id,
        dto.startTime.toISOString().split("T")[0]!,
      );

    for (const existing of existingShowtimes) {
      if (showtime.conflictWith(existing)) {
        throw new ApplicationError({
          code: ApplicationErrorCode.SHOWTIME_CONFLICT,
          message: "Showtime conflict",
        });
      }
    }

    await this.showtimeRepository.save(showtime);

    return {
      message: "Showtime created successfully",
      id: showtime.id.value,
      screenName: screen.name,
      movieTitle: movie.title,
      startTime: showtime.timeSlot.timeStart,
      endTime: showtime.timeSlot.timeEnd,
      pricing: showtime.pricing.amount,
      status: showtime.status,
      createdAt: showtime.createdAt,
    };
  }

  public async updateShowtime(
    request: ReplaceFields<
      UpdateShowtimeDTO,
      { showtimeID: string; status?: string }
    >,
  ): Promise<UpdateShowtimeResult> {
    const dto = validate(UpdateShowtimeDTOSchema, request);

    if (dto.pricing === undefined && dto.status === undefined) {
      throw new ApplicationError({
        code: ApplicationErrorCode.INVALID_INPUT,
        message: "At least one field (pricing or status) must be provided",
      });
    }

    const showtime = await this.showtimeRepository.showtimeOfID(dto.showtimeID);
    if (showtime === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SHOWTIME_NOT_FOUND,
        message: `Showtime with ID "${dto.showtimeID.value}" not found`,
      });
    }

    if (dto.pricing !== undefined) {
      showtime.updatePricing(Money.create(dto.pricing, CurrencyCode.IDR));
    }

    if (dto.status !== undefined) {
      switch (dto.status) {
        case ShowtimeStatus.CANCELLED:
          showtime.cancel();
          break;
        case ShowtimeStatus.COMPLETED:
          showtime.complete();
          break;
      }
    }

    await this.showtimeRepository.save(showtime);

    return {
      message: "Showtime updated successfully",
      id: showtime.id.value,
      pricing: showtime.pricing.amount,
      status: showtime.status,
    };
  }

  public async deleteShowtime(
    request: ReplaceFields<DeleteShowtimeDTO, { showtimeID: string }>,
  ): Promise<DeleteShowtimeResult> {
    const dto = validate(DeleteShowtimeDTOSchema, request);

    const showtime = await this.showtimeRepository.showtimeOfID(dto.showtimeID);
    if (showtime === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.SHOWTIME_NOT_FOUND,
        message: `Showtime with ID "${dto.showtimeID.value}" not found`,
      });
    }

    showtime.softDelete(dto.deletedBy);

    await this.showtimeRepository.save(showtime);

    return {
      message: "Showtime deleted successfully",
      id: showtime.id.value,
    };
  }
}
