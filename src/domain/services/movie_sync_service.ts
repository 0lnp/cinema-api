import { Inject } from "@nestjs/common";
import { Movie } from "../aggregates/movie";
import { MovieProvider } from "../ports/movie_provider";
import { MovieRepository } from "../repositories/movie_repository";
import { UserID } from "../value_objects/user_id";

export class MovieSyncService {
  public constructor(
    @Inject(MovieProvider.name)
    private readonly movieProvider: MovieProvider,
    @Inject(MovieRepository.name)
    private readonly movieRepository: MovieRepository,
  ) {}

  public async syncMovie(
    externalID: string,
    createdBy: UserID,
  ): Promise<Movie | null> {
    const [movieID, movieData, certificate] = await Promise.all([
      this.movieRepository.nextIdentity(),
      this.movieProvider.movieOfID(externalID),
      this.movieProvider.certificate(externalID),
    ]);

    if (movieData === null || certificate === null) {
      return null;
    }

    return Movie.create({
      ...movieData,
      id: movieID,
      createdBy,
      certificate,
    });
  }
}
