import { MovieID } from "src/domain/value_objects/movie_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { UserID } from "src/domain/value_objects/user_id";
import { ShowtimeSortField } from "src/domain/repositories/showtime_repository";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export interface CreateShowtimeDTO {
  createdBy: UserID;
  movieID: MovieID;
  screenID: ScreenID;
  startTime: Date;
  pricing: number;
}

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

export interface GetShowtimeDTO {
  showtimeID: ShowtimeID;
}

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

export interface GetAllShowtimesDTO {
  screenID?: ScreenID;
  movieID?: MovieID;
  date?: string;
  status?: ShowtimeStatus;
}

export interface GetAllShowtimesRequest {
  query: PaginatedQuery<ShowtimeSortField>;
  filters?: {
    screenID?: ScreenID;
    movieID?: MovieID;
    date?: string;
    status?: ShowtimeStatus;
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

export type GetAllShowtimesResult = PaginatedResult<ShowtimeListItem> & {
  message: string;
};

export interface UpdateShowtimeDTO {
  showtimeID: ShowtimeID;
  pricing?: number;
  status?: ShowtimeStatus;
}

export interface UpdateShowtimeResult {
  message: string;
  id: string;
  pricing: number;
  status: string;
}

export interface DeleteShowtimeDTO {
  deletedBy: UserID;
  showtimeID: ShowtimeID;
}

export interface DeleteShowtimeResult {
  message: string;
  id: string;
}
