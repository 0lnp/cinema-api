import { MovieCertificate } from "src/domain/value_objects/movie_certificate";
import { MovieID } from "src/domain/value_objects/movie_id";
import { MovieStatus } from "src/domain/value_objects/movie_status";
import { PaginatedQueryDTOSchema } from "./shared_dto";
import * as z from "zod";

export const PostMovieBodyDTOSchema = z.object({
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(100, { message: "Title must be at most 100 characters" }),
  synopsis: z
    .string()
    .min(1, { message: "Synopsis is required" })
    .max(1000, { message: "Synopsis must be at most 1000 characters" }),
  duration_minutes: z
    .number()
    .min(1, { message: "Duration must be at least 1 minute" }),
  genres: z.array(z.string().max(50)).min(1, { message: "At least one genre is required" }),
  certificate: z.enum(MovieCertificate, {
    message: "Invalid certificate value",
  }),
  release_year: z
    .number()
    .min(1000, { message: "Invalid release year" }),
  poster_path: z
    .string()
    .min(1, { message: "Poster path is required" })
    .max(100),
});

export type PostMovieBodyDTO = z.infer<typeof PostMovieBodyDTOSchema>;

export const GetMoviesQueryDTOSchema = z.intersection(
  z.object({
    status: z.enum(MovieStatus).optional(),
    genre: z.string().max(50).optional(),
    release_year: z.coerce.number().min(1000).optional(),
  }),
  PaginatedQueryDTOSchema,
);

export type GetMoviesQueryDTO = z.infer<typeof GetMoviesQueryDTOSchema>;

export const GetMovieSearchExternalQueryDTOSchema = z.object({
  v: z
    .string()
    .min(2, { message: "Search keyword must be at least 2 characters" })
    .max(255, { message: "Search keyword must be at most 255 characters" }),
});

export type GetMovieSearchExternalQueryDTO = z.infer<typeof GetMovieSearchExternalQueryDTOSchema>;

export const PostMovieSyncBodyDTOSchema = z.object({
  external_id: z
    .string()
    .min(1, { message: "External ID is required" }),
});

export type PostMovieSyncBodyDTO = z.infer<typeof PostMovieSyncBodyDTOSchema>;

export const PatchMovieIDParamsDTOSchema = z.object({
  movie_id: z
    .string()
    .min(1, { message: "Movie ID is required" })
    .max(100)
    .regex(/^MOV_[\w-]+$/, { message: "Invalid movie ID format" })
    .transform((value) => new MovieID(value)),
});

export type PatchMovieIDParamsDTO = z.infer<typeof PatchMovieIDParamsDTOSchema>;

export const PatchMovieIDBodyDTOSchema = z.object({
  status: z.enum(MovieStatus, {
    message: "Invalid status value",
  }),
});

export type PatchMovieIDBodyDTO = z.infer<typeof PatchMovieIDBodyDTOSchema>;

export const DeleteMovieParamsDTOSchema = z.object({
  movie_id: z
    .string()
    .min(1, { message: "Movie ID is required" })
    .max(100)
    .regex(/^MOV_[\w-]+$/, { message: "Invalid movie ID format" })
    .transform((value) => new MovieID(value)),
});

export type DeleteMovieParamsDTO = z.infer<typeof DeleteMovieParamsDTOSchema>;
