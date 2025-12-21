import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import {
  GetShowtimeParamsDTO,
  PatchShowtimeBodyDTO,
  PatchShowtimeParamsDTO,
  PostShowtimeBodyDTO,
} from "../dtos/showtime_dto";
import {
  CreateShowtimeDTO,
  CreateShowtimeResult,
  DeleteShowtimeResult,
  GetAllShowtimesResult,
  GetShowtimeDTO,
  GetShowtimeResult,
  UpdateShowtimeDTO,
  UpdateShowtimeResult,
} from "src/application/dtos/showtime_dto";

export interface CreateResponse {
  id: string;
  screen_name: string;
  movie_title: string;
  start_time: string;
  end_time: string;
  pricing: number;
  status: string;
  created_at: string;
}

export interface GetResponse {
  id: string;
  movie_id: string;
  movie_title: string;
  screen_id: string;
  screen_name: string;
  start_time: string;
  end_time: string;
  pricing: number;
  status: string;
  created_at: string;
}

export interface GetAllResponse {
  items: Array<{
    id: string;
    movie_id: string;
    movie_title: string;
    screen_id: string;
    screen_name: string;
    start_time: string;
    end_time: string;
    pricing: number;
    status: string;
  }>;
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface UpdateResponse {
  id: string;
  pricing: number;
  status: string;
}

export interface DeleteResponse {
  id: string;
}

export class ShowtimeMapper {
  public static toCreateRequest(
    body: PostShowtimeBodyDTO,
  ): Omit<CreateShowtimeDTO, "createdBy"> {
    return {
      movieID: body.movie_id,
      screenID: body.screen_id,
      startTime: body.start_time,
      pricing: body.pricing,
    };
  }

  public static toCreateResponse(
    result: CreateShowtimeResult,
  ): BaseSuccessfulResponse<CreateResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        screen_name: result.screenName,
        movie_title: result.movieTitle,
        start_time: result.startTime.toISOString(),
        end_time: result.endTime.toISOString(),
        pricing: result.pricing,
        status: result.status,
        created_at: result.createdAt.toISOString(),
      },
    };
  }

  public static toGetRequest(
    params: GetShowtimeParamsDTO,
  ): GetShowtimeDTO {
    return {
      showtimeID: params.showtime_id,
    };
  }

  public static toGetResponse(
    result: GetShowtimeResult,
  ): BaseSuccessfulResponse<GetResponse> {
    return {
      message: "Showtime retrieved successfully",
      data: {
        id: result.id,
        movie_id: result.movieID,
        movie_title: result.movieTitle,
        screen_id: result.screenID,
        screen_name: result.screenName,
        start_time: result.startTime.toISOString(),
        end_time: result.endTime.toISOString(),
        pricing: result.pricing,
        status: result.status,
        created_at: result.createdAt.toISOString(),
      },
    };
  }

  public static toGetAllResponse(
    result: GetAllShowtimesResult,
  ): BaseSuccessfulResponse<GetAllResponse> {
    return {
      message: "Showtimes retrieved successfully",
      data: {
        items: result.items.map((showtime) => ({
          id: showtime.id,
          movie_id: showtime.movieID,
          movie_title: showtime.movieTitle,
          screen_id: showtime.screenID,
          screen_name: showtime.screenName,
          start_time: showtime.startTime.toISOString(),
          end_time: showtime.endTime.toISOString(),
          pricing: showtime.pricing,
          status: showtime.status,
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.totalPages,
      },
    };
  }

  public static toUpdateRequest(
    params: PatchShowtimeParamsDTO,
    body: PatchShowtimeBodyDTO,
  ): UpdateShowtimeDTO {
    return {
      showtimeID: params.showtime_id,
      pricing: body?.pricing,
      status: body?.status,
    };
  }

  public static toUpdateResponse(
    result: UpdateShowtimeResult,
  ): BaseSuccessfulResponse<UpdateResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        pricing: result.pricing,
        status: result.status,
      },
    };
  }

  public static toDeleteResponse(
    result: DeleteShowtimeResult,
  ): BaseSuccessfulResponse<DeleteResponse> {
    return {
      message: result.message,
      data: { id: result.id },
    };
  }
}
