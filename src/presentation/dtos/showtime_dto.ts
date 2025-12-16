export interface PostShowtimeBodyDTO {
  movie_id: string;
  screen_id: string;
  start_time: string;
  pricing: number;
}

export interface GetShowtimeParamsDTO {
  showtime_id: string;
}

export interface GetShowtimesQueryDTO {
  screen_id?: string;
  date?: string;
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
