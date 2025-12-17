import { MovieID } from "src/domain/value_objects/movie_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { UserID } from "src/domain/value_objects/user_id";
import { ShowtimeSortField } from "src/domain/repositories/showtime_repository";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";
import * as z from "zod";

export const CreateShowtimeDTOSchema = z.object({
  createdBy: z.instanceof(UserID),
  movieID: z
    .string()
    .max(100)
    .regex(/^MOV_[\w-]+$/, {
      error: "Invalid movie ID format",
    })
    .transform((value) => new MovieID(value)),
  screenID: z
    .string()
    .max(100)
    .regex(/^SCR_[\w-]+$/, {
      error: "Invalid screen ID format",
    })
    .transform((value) => new ScreenID(value)),
  startTime: z.date(),
  pricing: z.number().min(0),
});

export type CreateShowtimeDTO = z.infer<typeof CreateShowtimeDTOSchema>;

export interface CreateShowtimeResult {
  message: string;
  id: string;
  screenName: string;
  movieTitle: string;
  startTime: Date;
  endTime: Date;
  pricing: number;
  status: string;
  createdAt: Date;
}

export const GetShowtimeDTOSchema = z.object({
  showtimeID: z
    .string()
    .max(100)
    .regex(/^SHW_[\w-]+$/, {
      error: "Invalid showtime ID format",
    })
    .transform((value) => new ShowtimeID(value)),
});

export type GetShowtimeDTO = z.infer<typeof GetShowtimeDTOSchema>;

export interface GetShowtimeResult {
  id: string;
  movieID: string;
  movieTitle: string;
  screenID: string;
  screenName: string;
  startTime: Date;
  endTime: Date;
  pricing: number;
  status: string;
  createdAt: Date;
}

export const GetAllShowtimesDTOSchema = z.object({
  screenID: z
    .string()
    .max(100)
    .regex(/^SCR_[\w-]+$/, {
      error: "Invalid screen ID format",
    })
    .transform((value) => new ScreenID(value))
    .optional(),
  movieID: z
    .string()
    .max(100)
    .regex(/^MOV_[\w-]+$/, {
      error: "Invalid movie ID format",
    })
    .transform((value) => new MovieID(value))
    .optional(),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      error: "Invalid date format. Expected YYYY-MM-DD",
    })
    .optional(),
  status: z.enum(ShowtimeStatus).optional(),
});

export type GetAllShowtimesDTO = z.infer<typeof GetAllShowtimesDTOSchema>;

export interface GetAllShowtimesRequest {
  query: PaginatedQuery<ShowtimeSortField>;
  filters?: {
    screenID?: string;
    movieID?: string;
    date?: string;
    status?: string;
  };
}

export interface ShowtimeListItem {
  id: string;
  movieID: string;
  movieTitle: string;
  screenID: string;
  screenName: string;
  startTime: Date;
  endTime: Date;
  pricing: number;
  status: string;
}

export type GetAllShowtimesResult = PaginatedResult<ShowtimeListItem>;

export const UpdateShowtimeDTOSchema = z.object({
  showtimeID: z
    .string()
    .max(100)
    .regex(/^SHW_[\w-]+$/, {
      error: "Invalid showtime ID format",
    })
    .transform((value) => new ShowtimeID(value)),
  pricing: z.number().min(0).optional(),
  status: z.enum(ShowtimeStatus).optional(),
});

export type UpdateShowtimeDTO = z.infer<typeof UpdateShowtimeDTOSchema>;

export interface UpdateShowtimeResult {
  message: string;
  id: string;
  pricing: number;
  status: string;
}

export const DeleteShowtimeDTOSchema = z.object({
  deletedBy: z.instanceof(UserID),
  showtimeID: z
    .string()
    .max(100)
    .regex(/^SHW_[\w-]+$/, {
      error: "Invalid showtime ID format",
    })
    .transform((value) => new ShowtimeID(value)),
});

export type DeleteShowtimeDTO = z.infer<typeof DeleteShowtimeDTOSchema>;

export interface DeleteShowtimeResult {
  message: string;
  id: string;
}
