import { InjectRepository } from "@nestjs/typeorm";
import { MovieRepository } from "src/domain/repositories/movie_repository";
import { MovieORMEntity } from "../databases/orm_entities/movie_orm_entity";
import { IsNull, Repository } from "typeorm";
import { Movie } from "src/domain/aggregates/movie";
import { MovieID } from "src/domain/value_objects/movie_id";
import { MovieStatus } from "src/domain/value_objects/movie_status";
import { UserID } from "src/domain/value_objects/user_id";
import {
  InfrastructureError,
  InfrastructureErrorCode,
} from "src/shared/exceptions/infrastructure_error";

export class TypeormMovieRepository implements MovieRepository {
  public constructor(
    @InjectRepository(MovieORMEntity)
    private readonly ormRepository: Repository<MovieORMEntity>,
  ) {}

  public async movieOfID(id: MovieID): Promise<Movie | null> {
    const movie = await this.ormRepository.findOneBy({
      id: id.value,
      deletedAt: IsNull(),
    });
    return movie !== null ? this.toDomain(movie) : null;
  }

  public async save(movie: Movie): Promise<void> {
    const movieEntity = this.toPersistence(movie);
    await this.ormRepository.save(movieEntity);
  }

  public async nextIdentity(): Promise<MovieID> {
    const maxAttempts = 3;
    let attempt = 0;

    while (attempt < maxAttempts) {
      const id = MovieID.generate();
      const exists = await this.ormRepository.existsBy({ id: id.value });

      if (!exists) {
        return id;
      }

      attempt++;
    }

    throw new InfrastructureError({
      code: InfrastructureErrorCode.ID_GENERATION_FAILED,
      message: `Failed to generate unique MovieID after ${maxAttempts} attempts`,
    });
  }

  private toDomain(movie: MovieORMEntity): Movie {
    return new Movie({
      id: new MovieID(movie.id),
      title: movie.title,
      synopsis: movie.synopsis,
      durationMinutes: movie.durationMinutes,
      releaseYear: movie.releaseYear,
      certificate: movie.certificate,
      genres: movie.genres,
      posterPath: movie.posterPath,
      status: movie.status as MovieStatus,
      createdBy: new UserID(movie.createdBy),
      createdAt: movie.createdAt,
      lastModifiedAt: movie.lastModifiedAt,
      deletedAt: movie.deletedAt,
      deletedBy: movie.deletedBy !== null ? new UserID(movie.deletedBy) : null,
    });
  }

  private toPersistence(movie: Movie): MovieORMEntity {
    return {
      id: movie.id.value,
      title: movie.title,
      synopsis: movie.synopsis,
      durationMinutes: movie.durationMinutes,
      releaseYear: movie.releaseYear,
      certificate: movie.certificate,
      genres: movie.genres,
      posterPath: movie.posterPath,
      status: movie.status,
      createdBy: movie.createdBy.value,
      createdAt: movie.createdAt,
      lastModifiedAt: movie.lastModifiedAt,
      deletedAt: movie.deletedAt,
      deletedBy: movie.deletedBy?.value ?? null,
    };
  }
}
