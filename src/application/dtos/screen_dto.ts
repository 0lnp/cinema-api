import { ScreenID } from "src/domain/value_objects/screen_id";
import { UserID } from "src/domain/value_objects/user_id";
import * as z from "zod";

export const CreateScreenDTOSchema = z.object({
  createdBy: z.instanceof(UserID),
  name: z.string().min(2).max(100),
  rows: z.array(
    z.object({
      label: z.string().min(1).max(50),
      seatCount: z.number().min(1),
    }),
  ),
});

export type CreateScreenDTO = z.infer<typeof CreateScreenDTOSchema>;

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

export const SetScreenLayoutDTOSchema = z.object({
  screenID: z
    .string()
    .max(100)
    .regex(/^SCR_[\w-]+$/, {
      error: "Invalid screen ID format",
    })
    .transform((value) => new ScreenID(value)),
  rows: z.array(
    z.object({
      label: z.string().min(1).max(50),
      seatCount: z.number().min(1),
    }),
  ),
});

export type SetScreenLayoutDTO = z.infer<typeof SetScreenLayoutDTOSchema>;

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

export const DeleteScreenDTOSchema = z.object({
  deletedBy: z.instanceof(UserID),
  screenID: z
    .string()
    .max(100)
    .regex(/^SCR_[\w-]+$/, {
      error: "Invalid screen ID format",
    })
    .transform((value) => new ScreenID(value)),
});

export type DeleteScreenDTO = z.infer<typeof DeleteScreenDTOSchema>;

export interface DeleteScreenResult {
  message: string;
  id: string;
}
