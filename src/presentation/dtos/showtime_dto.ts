import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { PaginatedQueryRaw } from "../pipes/parse_paginated_query_pipe";

export interface PostShowtimeBodyDTO {
  movie_id: string;
  screen_id: string;
  start_time: string;
  pricing: number;
}

export interface GetShowtimeParamsDTO {
  showtime_id: string;
}

export interface GetShowtimesQueryDTO extends PaginatedQueryRaw {
  screen_id?: string;
  movie_id?: string;
  date?: string;
  status?: ShowtimeStatus;
}

export interface PatchShowtimeParamsDTO {
  showtime_id: string;
}

export interface PatchShowtimeBodyDTO {
  pricing?: number;
  status?: string;
}

export interface DeleteShowtimeParamsDTO {
  showtime_id: string;
}
