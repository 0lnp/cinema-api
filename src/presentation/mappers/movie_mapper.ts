import {
  ChangeMovieStatusDTO,
  ChangeMovieStatusResult,
  CreateMovieDTO,
  CreateMovieResult,
  DeleteMovieResult,
  SearchFromExternalResult,
} from "src/application/dtos/movie_dto";
import {
  PatchMovieIDBodyDTO,
  PatchMovieIDParamsDTO,
  PostMovieBodyDTO,
} from "../dtos/movie_dto";
import { BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import { ReplaceFields } from "src/shared/types/replace_fields";

export interface CreateResponse {
  id: string;
  title: string;
  created_at: string;
}

export interface SearchResponse {
  results: Array<{
    external_id: string;
    title: string;
    synopsis: string;
    release_year: number;
    poster_url: string;
  }>;
  result_count: number;
}

export interface ChangeStatusResponse {
  id: string;
  title: string;
}

export interface DeleteResponse {
  id: string;
}

export class MovieMapper {
  public static toCreateRequest(
    body: PostMovieBodyDTO,
  ): Omit<CreateMovieDTO, "createdBy"> {
    return {
      title: body.title,
      synopsis: body.synopsis,
      durationMinutes: body.duration_minutes,
      genres: body.genres,
      certificate: body.certificate,
      releaseYear: body.release_year,
      posterPath: body.poster_path,
    };
  }

  public static toCreateResponse(
    result: CreateMovieResult,
  ): BaseSuccessfulResponse<CreateResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        title: result.title,
        created_at: result.createdAt.toISOString(),
      },
    };
  }

  public static toSearchResponse(
    result: SearchFromExternalResult,
  ): BaseSuccessfulResponse<SearchResponse> {
    return {
      data: {
        results: result.results.map((movie) => ({
          external_id: movie.externalID,
          title: movie.title,
          synopsis: movie.synopsis,
          release_year: movie.releaseYear,
          poster_url: movie.posterURL,
        })),
        result_count: result.resultCount,
      },
    };
  }

  public static toChangeStatusRequest(
    params: PatchMovieIDParamsDTO,
    body: PatchMovieIDBodyDTO,
  ): ReplaceFields<
    ChangeMovieStatusDTO,
    {
      movieID: string;
      status: string;
    }
  > {
    return {
      movieID: params.movie_id,
      status: body.status,
    };
  }

  public static toChangeStatusResponse(
    result: ChangeMovieStatusResult,
  ): BaseSuccessfulResponse<ChangeStatusResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        title: result.title,
      },
    };
  }

  public static toDeleteResponse(
    result: DeleteMovieResult,
  ): BaseSuccessfulResponse<DeleteResponse> {
    return {
      message: result.message,
      data: { id: result.id },
    };
  }
}
