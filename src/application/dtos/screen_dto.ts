import { ScreenID } from "src/domain/value_objects/screen_id";
import { UserID } from "src/domain/value_objects/user_id";

export interface CreateScreenDTO {
  createdBy: UserID;
  name: string;
  rows: Array<{
    label: string;
    seatCount: number;
  }>;
}

export interface CreateScreenResult {
  message: string;
  id: string;
  name: string;
  capacity: number;
  seatLayout: Array<{
    label: string;
    seatCount: number;
  }>;
  createdAt: Date;
}

export interface SetScreenLayoutDTO {
  screenID: ScreenID;
  rows: Array<{
    label: string;
    seatCount: number;
  }>;
}

export interface SetScreenLayoutResult {
  message: string;
  id: string;
  name: string;
  capacity: number;
  seatLayout: Array<{
    label: string;
    seatCount: number;
  }>;
}

export interface DeleteScreenDTO {
  deletedBy: UserID;
  screenID: ScreenID;
}

export interface DeleteScreenResult {
  message: string;
  id: string;
}
