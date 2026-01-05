import { EventID } from "src/domain/value_objects/event_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { UserID } from "src/domain/value_objects/user_id";
import { ShowtimeSortField } from "src/domain/repositories/showtime_repository";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export interface CreateShowtimeDTO {
  createdBy: UserID;
  eventID: EventID;
  screenID: ScreenID;
  startTime: Date;
  pricing: number;
}

export interface CreateShowtimeResult {
  message: string;
  id: string;
  screenName: string;
  eventTitle: string;
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
  eventID: string;
  eventTitle: string;
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
  eventID?: EventID;
  date?: string;
  status?: ShowtimeStatus;
}

export interface GetAllShowtimesRequest {
  query: PaginatedQuery<ShowtimeSortField>;
  filters?: {
    screenID?: ScreenID;
    eventID?: EventID;
    date?: string;
    status?: ShowtimeStatus;
  };
}

export interface ShowtimeListItem {
  id: string;
  eventID: string;
  eventTitle: string;
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
