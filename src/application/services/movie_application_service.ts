import { validate } from "src/shared/utilities/validation";
import {
  ChangeMovieStatusDTO,
  ChangeMovieStatusDTOSchema,
  ChangeMovieStatusResult,
  CreateFromExternalDTO,
  CreateFromExternalDTOSchema,
  CreateMovieDTO,
  CreateMovieDTOSchema,
  CreateMovieResult,
  DeleteMovieDTO,
  DeleteMovieDTOSchema,
  DeleteMovieResult,
  GetAllMoviesDTOSchema,
  GetAllMoviesRequest,
  GetAllMoviesResult,
  MovieListItem,
  SearchFromExternalDTO,
  SearchFromExternalDTOSchema,
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
import { ReplaceFields } from "src/shared/types/replace_fields";
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
    const filtersDTO = validate(GetAllMoviesDTOSchema, request.filters);

    const result = await this.movieRepository.allMovies(
      request.query,
      filtersDTO,
    );

    return {
      items: this.mapAllMovieListItems(result.items),
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    };
  }

  public async create(request: CreateMovieDTO): Promise<CreateMovieResult> {
    const dto = validate(CreateMovieDTOSchema, request);

    const movieID = await this.movieRepository.nextIdentity();

    const movie = Movie.create({
      ...dto,
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
    const dto = validate(SearchFromExternalDTOSchema, request);
    const searchResult = await this.movieProvider.searchMovie(dto.keyword);

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
    const dto = validate(CreateFromExternalDTOSchema, request);

    const movie = await this.movieSyncService.syncMovie(
      dto.externalID,
      dto.createdBy,
    );
    if (movie === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Movie with external ID "${dto.externalID}" not found"`,
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
    request: ReplaceFields<
      ChangeMovieStatusDTO,
      { movieID: string; status: string }
    >,
  ): Promise<ChangeMovieStatusResult> {
    const dto = validate(ChangeMovieStatusDTOSchema, request);

    const movie = await this.movieRepository.movieOfID(dto.movieID);
    if (movie === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Movie with ID "${dto.movieID.value}" not found`,
      });
    }

    movie.changeStatus(dto.status);
    await this.movieRepository.save(movie);

    return {
      message: "Movie status updated successfully",
      id: movie.id.value,
      title: movie.title,
    };
  }

  public async deleteMovie(
    request: ReplaceFields<DeleteMovieDTO, { movieID: string }>,
  ): Promise<DeleteMovieResult> {
    const dto = validate(DeleteMovieDTOSchema, request);

    const movie = await this.movieRepository.movieOfID(dto.movieID);
    if (movie === null) {
      throw new ApplicationError({
        code: ApplicationErrorCode.RESOURCE_NOT_FOUND,
        message: `Movie with ID "${dto.movieID.value}" not found`,
      });
    }

    movie.softDelete(dto.deletedBy);

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
