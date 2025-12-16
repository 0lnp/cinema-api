import { MovieCertificate } from "src/domain/value_objects/movie_certificate";

export interface PostMovieBodyDTO {
  title: string;
  synopsis: string;
  duration_minutes: number;
  genres: Array<string>;
  certificate: MovieCertificate;
  release_year: number;
  poster_path: string;
}

export interface GetMovieSearchQueryDTO {
  v: string;
}

export interface PostMovieSyncBodyDTO {
  external_id: string;
}

export interface PatchMovieIDParamsDTO {
  movie_id: string;
}

export interface PatchMovieIDBodyDTO {
  status: string;
}

export interface DeleteMovieParamsDTO {
  movie_id: string;
}
