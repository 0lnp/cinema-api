import * as z from "zod";

export const TMDBMovieSearchResultDTOSchema = z.object({
  page: z.number(),
  results: z.array(
    z.object({
      id: z.number(),
      title: z.string(),
      overview: z.string(),
      release_date: z.string(),
      poster_path: z.string().nullable(),
    }),
  ),
  total_pages: z.number(),
  total_results: z.number(),
});

export type TMDBMovieSearchResultDTO = z.infer<
  typeof TMDBMovieSearchResultDTOSchema
>;

export const TMDBMovieDetailsDTOSchema = z.object({
  id: z.number(),
  title: z.string(),
  overview: z.string(),
  runtime: z.number(),
  genres: z.array(
    z.object({
      id: z.number(),
      name: z.string(),
    }),
  ),
  release_date: z.string(),
  poster_path: z.string().nullable(),
});

export type TMDBMovieDetailsDTO = z.infer<typeof TMDBMovieDetailsDTOSchema>;

const TMDBReleaseDateResultSchema = z.object({
  iso_3166_1: z.string(),
  release_dates: z.array(
    z.object({
      certification: z.string(),
      iso_639_1: z.string(),
      release_date: z.string(),
      type: z.number(),
      note: z.string(),
    }),
  ),
});

export const TMDBReleaseDatesDTOSchema = z.object({
  id: z.number(),
  results: z.array(TMDBReleaseDateResultSchema),
});

export type TMDBReleaseDateResultDTO = z.infer<
  typeof TMDBReleaseDateResultSchema
>;
export type TMDBReleaseDatesDTO = z.infer<typeof TMDBReleaseDatesDTOSchema>;
