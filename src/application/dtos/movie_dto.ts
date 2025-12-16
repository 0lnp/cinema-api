import { MovieCertificate } from "src/domain/value_objects/movie_certificate";
import { MovieID } from "src/domain/value_objects/movie_id";
import { MovieStatus } from "src/domain/value_objects/movie_status";
import { UserID } from "src/domain/value_objects/user_id";
import * as z from "zod";

export const CreateMovieDTOSchema = z.object({
  createdBy: z.instanceof(UserID),
  title: z.string().max(100),
  synopsis: z.string().max(1000),
  durationMinutes: z.number().min(1),
  genres: z.array(z.string().max(50)),
  certificate: z.enum(MovieCertificate),
  releaseYear: z.number().min(1000),
  posterPath: z.string().max(100),
});

export type CreateMovieDTO = z.infer<typeof CreateMovieDTOSchema>;

export const CreateFromExternalDTOSchema = z.object({
  createdBy: z.instanceof(UserID),
  externalID: z.string().min(1),
});

export type CreateFromExternalDTO = z.infer<typeof CreateFromExternalDTOSchema>;

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

export const SearchFromExternalDTOSchema = z.object({
  keyword: z.string().min(2).max(255),
});

export type SearchFromExternalDTO = z.infer<typeof SearchFromExternalDTOSchema>;

export interface CreateMovieResult {
  message: string;
  id: string;
  title: string;
  createdAt: Date;
}

export const ChangeMovieStatusDTOSchema = z.object({
  movieID: z
    .string()
    .max(100)
    .regex(/^MOV_[\w-]+$/, {
      error: "Invalid movie ID format",
    })
    .transform((value) => new MovieID(value)),
  status: z.enum(MovieStatus),
});

export type ChangeMovieStatusDTO = z.infer<typeof ChangeMovieStatusDTOSchema>;

export interface ChangeMovieStatusResult {
  message: string;
  id: string;
  title: string;
}

export const DeleteMovieDTOSchema = z.object({
  deletedBy: z.instanceof(UserID),
  movieID: z
    .string()
    .max(100)
    .regex(/^MOV_[\w-]+$/, {
      error: "Invalid movie ID format",
    })
    .transform((value) => new MovieID(value)),
});

export type DeleteMovieDTO = z.infer<typeof DeleteMovieDTOSchema>;

export interface DeleteMovieResult {
  message: string;
  id: string;
}
