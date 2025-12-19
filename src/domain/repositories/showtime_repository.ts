import { Showtime } from "../aggregates/showtime";
import { MovieID } from "../value_objects/movie_id";
import { ScreenID } from "../value_objects/screen_id";
import { ShowtimeID } from "../value_objects/showtime_id";
import { ShowtimeStatus } from "../value_objects/showtime_status";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export type ShowtimeSortField = "timeStart" | "createdAt" | "basePrice";

export interface ShowtimeSearchFilters {
  screenID?: ScreenID;
  movieID?: MovieID;
  date?: string; // YYYY-MM-DD
  status?: ShowtimeStatus;
}

export abstract class ShowtimeRepository {
  public abstract showtimeOfID(id: ShowtimeID): Promise<Showtime | null>;
  public abstract showtimeOfScreenAndDate(
    screenID: ScreenID,
    date: string, // YYYY-MM-DD
  ): Promise<Showtime[]>;
  public abstract allShowtimes(
    query: PaginatedQuery<ShowtimeSortField>,
    filters?: ShowtimeSearchFilters,
  ): Promise<PaginatedResult<Showtime>>;
  public abstract upcomingShowtimesOfMovie(
    movieID: MovieID,
  ): Promise<Showtime[]>;
  public abstract nextIdentity(): Promise<ShowtimeID>;
  public abstract save(showtime: Showtime): Promise<void>;
}
