import { InjectRepository } from "@nestjs/typeorm";
import { ShowtimeORMEntity } from "../databases/orm_entities/showtime_orm_entity";
import {
  Between,
  IsNull,
  MoreThan,
  Repository,
  FindOptionsWhere,
} from "typeorm";
import { ShowtimeRepository } from "src/domain/repositories/showtime_repository";
import { Showtime } from "src/domain/aggregates/showtime";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { MovieID } from "src/domain/value_objects/movie_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { TimeSlot } from "src/domain/value_objects/time_slot";
import { Money } from "src/domain/value_objects/money";
import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { UserID } from "src/domain/value_objects/user_id";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";

export class TypeormShowtimeRepository implements ShowtimeRepository {
  public constructor(
    @InjectRepository(ShowtimeORMEntity)
    private readonly ormRepository: Repository<ShowtimeORMEntity>,
  ) {}

  public async showtimeOfID(id: ShowtimeID): Promise<Showtime | null> {
    const showtime = await this.ormRepository.findOneBy({
      id: id.value,
      deletedAt: IsNull(),
    });
    return showtime !== null ? this.toDomain(showtime) : null;
  }

  public async showtimeOfScreenAndDate(
    screenID: ScreenID,
    date: string,
  ): Promise<Showtime[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const showtime = await this.ormRepository.find({
      where: {
        screenID: screenID.value,
        timeStart: Between(startOfDay, endOfDay),
        deletedAt: IsNull(),
      },
    });
    return showtime.map(this.toDomain);
  }

  public async save(showtime: Showtime): Promise<void> {
    const showtimeEntity = this.toPersistence(showtime);
    await this.ormRepository.save(showtimeEntity);
  }

  public async allShowtimes(filters?: {
    screenID?: ScreenID;
    date?: string;
  }): Promise<Showtime[]> {
    const where: FindOptionsWhere<ShowtimeORMEntity> = {
      deletedAt: IsNull(),
    };

    if (filters?.screenID) {
      where.screenID = filters.screenID.value;
    }

    if (filters?.date) {
      const startOfDay = new Date(filters.date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(filters.date);
      endOfDay.setHours(23, 59, 59, 999);
      where.timeStart = Between(startOfDay, endOfDay);
    }

    const showtimes = await this.ormRepository.find({
      where,
      order: { timeStart: "ASC" },
    });
    return showtimes.map(this.toDomain);
  }

  public async upcomingShowtimesOfMovie(movieID: MovieID): Promise<Showtime[]> {
    const now = new Date();
    const showtimes = await this.ormRepository.find({
      where: {
        movieID: movieID.value,
        timeStart: MoreThan(now),
        deletedAt: IsNull(),
        status: ShowtimeStatus.SCHEDULED,
      },
      order: { timeStart: "ASC" },
    });
    return showtimes.map(this.toDomain);
  }

  public async nextIdentity(): Promise<ShowtimeID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = ShowtimeID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique ShowtimeID after ${maxAttempts} attempts`,
    });
  }

  private toDomain(showtime: ShowtimeORMEntity): Showtime {
    return new Showtime({
      id: new ShowtimeID(showtime.id),
      movieID: new MovieID(showtime.movieID),
      screenID: new ScreenID(showtime.screenID),
      timeSlot: new TimeSlot(showtime.timeStart, showtime.timeEnd),
      pricing: showtime.pricing as Money,
      status: showtime.status as ShowtimeStatus,
      createdAt: showtime.createdAt,
      createdBy: new UserID(showtime.createdBy),
      lastModifiedAt: showtime.lastModifiedAt,
      deletedAt: showtime.deletedAt,
      deletedBy:
        showtime.deletedBy !== null ? new UserID(showtime.deletedBy) : null,
    });
  }

  private toPersistence(showtime: Showtime): ShowtimeORMEntity {
    return {
      id: showtime.id.value,
      movieID: showtime.movieID.value,
      screenID: showtime.screenID.value,
      timeStart: showtime.timeSlot.timeStart,
      timeEnd: showtime.timeSlot.timeEnd,
      pricing: showtime.pricing,
      status: showtime.status,
      createdAt: showtime.createdAt,
      createdBy: showtime.createdBy.value,
      lastModifiedAt: showtime.lastModifiedAt,
      deletedAt: showtime.deletedAt,
      deletedBy: showtime.deletedBy?.value ?? null,
    };
  }
}
