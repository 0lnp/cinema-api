import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import {
  PatchScreenIDBodyDTO,
  PatchScreenIDParamsDTO,
  PostScreensBodyDTO,
} from "../dtos/screen_dto";
import {
  CreateScreenDTO,
  CreateScreenResult,
  DeleteScreenResult,
  SetScreenLayoutDTO,
  SetScreenLayoutResult,
} from "src/application/dtos/screen_dto";
import { ReplaceField } from "src/shared/types/replace_field";

export interface CreateResponse {
  id: string;
  name: string;
  capacity: number;
  seat_layout: Array<{
    label: string;
    seat_count: number;
  }>;
  created_at: string;
}

export interface SetLayoutResponse {
  id: string;
  name: string;
  capacity: number;
  seat_layout: Array<{
    label: string;
    seat_count: number;
  }>;
}

export interface DeleteResponse {
  id: string;
}

export class ScreenMapper {
  public static toCreateRequest(
    body: PostScreensBodyDTO,
  ): Omit<CreateScreenDTO, "createdBy"> {
    return {
      name: body.name,
      rows: body.rows.map((row) => ({
        label: row.label,
        seatCount: row.seat_count,
      })),
    };
  }

  public static toCreateResponse(
    result: CreateScreenResult,
  ): BaseSuccessfulResponse<CreateResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        name: result.name,
        capacity: result.capacity,
        seat_layout: result.seatLayout.map((seat) => ({
          label: seat.label,
          seat_count: seat.seatCount,
        })),
        created_at: result.createdAt.toISOString(),
      },
    };
  }

  public static toSetLayoutRequest(
    params: PatchScreenIDParamsDTO,
    body: PatchScreenIDBodyDTO,
  ): ReplaceField<SetScreenLayoutDTO, "screenID", string> {
    return {
      screenID: params.screen_id,
      rows: body.rows.map((row) => ({
        label: row.label,
        seatCount: row.seat_count,
      })),
    };
  }

  public static toSetLayoutResponse(
    result: SetScreenLayoutResult,
  ): BaseSuccessfulResponse<SetLayoutResponse> {
    return {
      message: result.message,
      data: {
        id: result.id,
        name: result.name,
        capacity: result.capacity,
        seat_layout: result.seatLayout.map((seat) => ({
          label: seat.label,
          seat_count: seat.seatCount,
        })),
      },
    };
  }

  public static toDeleteResponse(
    result: DeleteScreenResult,
  ): BaseSuccessfulResponse<DeleteResponse> {
    return {
      message: result.message,
      data: { id: result.id },
    };
  }
}
