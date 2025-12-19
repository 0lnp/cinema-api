import { Movie } from "../aggregates/movie";
import { MovieID } from "../value_objects/movie_id";
import { MovieStatus } from "../value_objects/movie_status";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export type MovieSortField =
  | "title"
  | "releaseYear"
  | "createdAt"
  | "durationMinutes";

export interface MovieSearchFilters {
  status?: MovieStatus;
  genre?: string;
  releaseYear?: number;
}

export abstract class MovieRepository {
  public abstract movieOfID(id: MovieID): Promise<Movie | null>;
  public abstract allMovies(
    query: PaginatedQuery<MovieSortField>,
    filters?: MovieSearchFilters,
  ): Promise<PaginatedResult<Movie>>;
  public abstract save(movie: Movie): Promise<void>;
  public abstract nextIdentity(): Promise<MovieID>;
}
