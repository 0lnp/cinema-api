import { MovieCertificate } from "src/domain/value_objects/movie_certificate";
import { MovieID } from "src/domain/value_objects/movie_id";
import { MovieStatus } from "src/domain/value_objects/movie_status";
import { UserID } from "src/domain/value_objects/user_id";
import { MovieSortField } from "src/domain/repositories/movie_repository";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export interface CreateMovieDTO {
  createdBy: UserID;
  title: string;
  synopsis: string;
  durationMinutes: number;
  genres: string[];
  certificate: MovieCertificate;
  releaseYear: number;
  posterPath: string;
}

export interface CreateMovieResult {
  message: string;
  id: string;
  title: string;
  createdAt: Date;
}

export interface CreateFromExternalDTO {
  createdBy: UserID;
  externalID: string;
}

export interface SearchFromExternalResult {
  results: Array<{
    externalID: string;
    title: string;
    synopsis: string;
    releaseYear: number;
    posterURL: string;
  }>;
  resultCount: number;
}

export interface SearchFromExternalDTO {
  keyword: string;
}

export interface ChangeMovieStatusDTO {
  movieID: MovieID;
  status: MovieStatus;
}

export interface ChangeMovieStatusResult {
  message: string;
  id: string;
  title: string;
}

export interface DeleteMovieDTO {
  deletedBy: UserID;
  movieID: MovieID;
}

export interface DeleteMovieResult {
  message: string;
  id: string;
}

export interface GetAllMoviesDTO {
  status?: MovieStatus;
  genre?: string;
  releaseYear?: number;
}

export interface GetAllMoviesRequest {
  query: PaginatedQuery<MovieSortField>;
  filters?: {
    status?: MovieStatus;
    genre?: string;
    releaseYear?: number;
  };
}

export interface MovieListItem {
  id: string;
  title: string;
  synopsis: string;
  duration: string;
  genres: string[];
  certificate: string;
  releaseYear: number;
  posterURL: string;
  status: MovieStatus;
  createdAt: Date;
}

export type GetAllMoviesResult = PaginatedResult<MovieListItem> & {
  message: string;
};
