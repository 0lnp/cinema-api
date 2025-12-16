import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import {
  GetShowtimeParamsDTO,
  GetShowtimesQueryDTO,
  PatchShowtimeBodyDTO,
  PatchShowtimeParamsDTO,
  PostShowtimeBodyDTO,
} from "../dtos/showtime_dto";
import {
  CreateShowtimeDTO,
  CreateShowtimeResult,
  DeleteShowtimeResult,
  GetAllShowtimesDTO,
  GetAllShowtimesResult,
  GetShowtimeDTO,
  GetShowtimeResult,
  UpdateShowtimeDTO,
  UpdateShowtimeResult,
} from "src/application/dtos/showtime_dto";
import { ReplaceFields } from "src/shared/types/replace_fields";

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
  showtimes: Array<{
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
  result_count: number;
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
  ): ReplaceFields<
    Omit<CreateShowtimeDTO, "createdBy">,
    { movieID: string; screenID: string }
  > {
    return {
      movieID: body.movie_id,
      screenID: body.screen_id,
      startTime: new Date(body.start_time),
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
  ): ReplaceFields<GetShowtimeDTO, { showtimeID: string }> {
    return {
      showtimeID: params.showtime_id,
    };
  }

  public static toGetResponse(
    result: GetShowtimeResult,
  ): BaseSuccessfulResponse<GetResponse> {
    return {
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

  public static toGetAllRequest(
    query: GetShowtimesQueryDTO,
  ): ReplaceFields<GetAllShowtimesDTO, { screenID?: string; date?: string }> {
    return {
      screenID: query.screen_id,
      date: query.date,
    };
  }

  public static toGetAllResponse(
    result: GetAllShowtimesResult,
  ): BaseSuccessfulResponse<GetAllResponse> {
    return {
      data: {
        showtimes: result.showtimes.map((showtime) => ({
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
        result_count: result.resultCount,
      },
    };
  }

  public static toUpdateRequest(
    params: PatchShowtimeParamsDTO,
    body: PatchShowtimeBodyDTO,
  ): ReplaceFields<UpdateShowtimeDTO, { showtimeID: string; status?: string }> {
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
