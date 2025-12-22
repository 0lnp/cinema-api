import { ScreenID } from "src/domain/value_objects/screen_id";
import * as z from "zod";

export const PostScreensBodyDTOSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters" })
    .max(100, { message: "Name must be at most 100 characters" }),
  rows: z
    .array(
      z.object({
        label: z
          .string()
          .min(1, { message: "Row label is required" })
          .max(50, { message: "Row label must be at most 50 characters" }),
        seat_count: z
          .number()
          .min(1, { message: "Seat count must be at least 1" }),
      }),
    )
    .min(1, { message: "At least one row is required" }),
});

export type PostScreensBodyDTO = z.infer<typeof PostScreensBodyDTOSchema>;

export const PatchScreenIDParamsDTOSchema = z.object({
  screen_id: z
    .string()
    .min(1, { message: "Screen ID is required" })
    .max(100)
    .regex(/^SCR_[\w-]+$/, { message: "Invalid screen ID format" })
    .transform((value) => new ScreenID(value)),
});

export type PatchScreenIDParamsDTO = z.infer<typeof PatchScreenIDParamsDTOSchema>;

export const PatchScreenIDBodyDTOSchema = z.object({
  rows: z
    .array(
      z.object({
        label: z
          .string()
          .min(1, { message: "Row label is required" })
          .max(50, { message: "Row label must be at most 50 characters" }),
        seat_count: z
          .number()
          .min(1, { message: "Seat count must be at least 1" }),
      }),
    )
    .min(1, { message: "At least one row is required" }),
});

export type PatchScreenIDBodyDTO = z.infer<typeof PatchScreenIDBodyDTOSchema>;

export const DeleteScreenParamsDTOSchema = z.object({
  screen_id: z
    .string()
    .min(1, { message: "Screen ID is required" })
    .max(100)
    .regex(/^SCR_[\w-]+$/, { message: "Invalid screen ID format" })
    .transform((value) => new ScreenID(value)),
});

export type DeleteScreenParamsDTO = z.infer<typeof DeleteScreenParamsDTOSchema>;
