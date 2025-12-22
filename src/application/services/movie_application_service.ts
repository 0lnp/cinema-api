import {
  ChangeMovieStatusDTO,
  ChangeMovieStatusResult,
  CreateFromExternalDTO,
  CreateMovieDTO,
  CreateMovieResult,
  DeleteMovieDTO,
  DeleteMovieResult,
  GetAllMoviesRequest,
  GetAllMoviesResult,
  MovieListItem,
  SearchFromExternalDTO,
  SearchFromExternalResult,
} from "../dtos/movie_dto";
import { MovieRepository } from "src/domain/repositories/movie_repository";
import { Inject } from "@nestjs/common";
import { Movie } from "src/domain/aggregates/movie";
import { MovieSyncService } from "src/domain/services/movie_sync_service";
import {
  ApplicationError,
  ApplicationErrorCode,
} from "src/shared/exceptions/application_error";
import { MovieProvider } from "src/domain/ports/movie_provider";
import { ConfigService } from "@nestjs/config";
import { AppConfig } from "src/infrastructure/configs/app_config";
import { formatDuration } from "src/shared/utilities/format_duration";

export class MovieApplicationService {
  public constructor(
    @Inject(MovieRepository.name)
    private readonly movieRepository: MovieRepository,
    @Inject(MovieSyncService.name)
    private readonly movieSyncService: MovieSyncService,
    @Inject(MovieProvider.name)
    private readonly movieProvider: MovieProvider,
    @Inject(ConfigService)
    private readonly config: ConfigService<AppConfig, true>,
  ) {}

  public async getAllMovies(
    request: GetAllMoviesRequest,
  ): Promise<GetAllMoviesResult> {
    const result = await this.movieRepository.allMovies(
      request.query,
      request.filters,
    );

    return {
      message: "Movies retrieved successfully",
      items: this.mapAllMovieListItems(result.items),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  public async create(request: CreateMovieDTO): Promise<CreateMovieResult> {
    const movieID = await this.movieRepository.nextIdentity();

    const movie = Movie.create({
      ...request,
      id: movieID,
    });

    await this.movieRepository.save(movie);

    return {
      message: "Movie created successfully",
      id: movie.id.value,
      title: movie.title,
      createdAt: movie.createdAt,
    };
  }

  public async searchFromExternal(
    request: SearchFromExternalDTO,
  ): Promise<SearchFromExternalResult> {
    const searchResult = await this.movieProvider.searchMovie(request.keyword);

    return {
      results: searchResult.results.map((movie) => ({
        ...movie,
        posterURL:
          this.config.get("MOVIE_POSTER_BASE_URL", { infer: true }) +
          movie.posterPath,
      })),
      resultCount: searchResult.resultCount,
    };
  }

  public async createFromExternal(
    request: CreateFromExternalDTO,
  ): Promise<CreateMovieResult> {
    const movie = await this.movieSyncService.syncMovie(
      request.externalID,
      request.createdBy,
    );
    if (movie === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Movie with external ID "${request.externalID}" not found"`,
      });
    }

    await this.movieRepository.save(movie);

    return {
      message: "Movie created successfully",
      id: movie.id.value,
      title: movie.title,
      createdAt: movie.createdAt,
    };
  }

  public async changeStatus(
    request: ChangeMovieStatusDTO,
  ): Promise<ChangeMovieStatusResult> {
    const movie = await this.movieRepository.movieOfID(request.movieID);
    if (movie === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Movie with ID "${request.movieID.value}" not found`,
      });
    }

    movie.changeStatus(request.status);
    await this.movieRepository.save(movie);

    return {
      message: "Movie status updated successfully",
      id: movie.id.value,
      title: movie.title,
    };
  }

  public async deleteMovie(
    request: DeleteMovieDTO,
  ): Promise<DeleteMovieResult> {
    const movie = await this.movieRepository.movieOfID(request.movieID);
    if (movie === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Movie with ID "${request.movieID.value}" not found`,
      });
    }

    movie.softDelete(request.deletedBy);

    await this.movieRepository.save(movie);

    return {
      message: "Movie deleted successfully",
      id: movie.id.value,
    };
  }

  private mapAllMovieListItems(movies: Movie[]): MovieListItem[] {
    return movies.map((movie) => ({
      id: movie.id.value,
      title: movie.title,
      synopsis: movie.synopsis,
      duration: formatDuration(movie.durationMinutes),
      genres: movie.genres,
      certificate: movie.certificate,
      releaseYear: movie.releaseYear,
      posterURL:
        this.config.get("MOVIE_POSTER_BASE_URL", { infer: true }) +
        movie.posterPath,
      status: movie.status,
      createdAt: movie.createdAt,
    }));
  }
}
