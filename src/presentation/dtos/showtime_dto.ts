import { ShowtimeStatus } from "src/domain/value_objects/showtime_status";
import { EventID } from "src/domain/value_objects/event_id";
import { ScreenID } from "src/domain/value_objects/screen_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { PaginatedQueryDTOSchema } from "./shared_dto";
import * as z from "zod";

export const PostShowtimeBodyDTOSchema = z.object({
  event_id: z
    .string()
    .min(1, { message: "Event ID is required" })
    .max(100)
    .regex(/^EVT_[\w-]+$/, { message: "Invalid event ID format" })
    .transform((value) => new EventID(value)),
  screen_id: z
    .string()
    .min(1, { message: "Screen ID is required" })
    .max(100)
    .regex(/^SCR_[\w-]+$/, { message: "Invalid screen ID format" })
    .transform((value) => new ScreenID(value)),
  start_time: z
    .string()
    .min(1, { message: "Start time is required" })
    .refine(
      (value) => {
        const date = new Date(value);
        return !isNaN(date.getTime());
      },
      { message: "Invalid date format" },
    )
    .refine(
      (value) => {
        const date = new Date(value);
        return date.getTime() > Date.now();
      },
      { message: "Start time must be in the future" },
    )
    .transform((value) => new Date(value)),
  pricing: z.number().min(0, { message: "Pricing must be a positive number" }),
});

export type PostShowtimeBodyDTO = z.infer<typeof PostShowtimeBodyDTOSchema>;

export const GetShowtimeParamsDTOSchema = z.object({
  showtime_id: z
    .string()
    .min(1, { message: "Showtime ID is required" })
    .max(100)
    .regex(/^SHW_[\w-]+$/, { message: "Invalid showtime ID format" })
    .transform((value) => new ShowtimeID(value)),
});

export type GetShowtimeParamsDTO = z.infer<typeof GetShowtimeParamsDTOSchema>;

export const GetShowtimesQueryDTOSchema = z.intersection(
  z.object({
    screen_id: z
      .string()
      .max(100)
      .regex(/^SCR_[\w-]+$/, { message: "Invalid screen ID format" })
      .transform((value) => new ScreenID(value))
      .optional(),
    event_id: z
      .string()
      .max(100)
      .regex(/^EVT_[\w-]+$/, { message: "Invalid event ID format" })
      .transform((value) => new EventID(value))
      .optional(),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, {
        message: "Invalid date format. Expected YYYY-MM-DD",
      })
      .optional(),
    status: z.enum(ShowtimeStatus).optional(),
  }),
  PaginatedQueryDTOSchema,
);

export type GetShowtimesQueryDTO = z.infer<typeof GetShowtimesQueryDTOSchema>;

export const PatchShowtimeParamsDTOSchema = z.object({
  showtime_id: z
    .string()
    .min(1, { message: "Showtime ID is required" })
    .max(100)
    .regex(/^SHW_[\w-]+$/, { message: "Invalid showtime ID format" })
    .transform((value) => new ShowtimeID(value)),
});

export type PatchShowtimeParamsDTO = z.infer<
  typeof PatchShowtimeParamsDTOSchema
>;

export const PatchShowtimeBodyDTOSchema = z
  .object({
    pricing: z
      .number()
      .min(0, { message: "Pricing must be a positive number" })
      .optional(),
    status: z
      .enum(ShowtimeStatus, { message: "Invalid status value" })
      .optional(),
  })
  .refine((data) => data.pricing !== undefined || data.status !== undefined, {
    message: "At least one field (pricing or status) must be provided",
  });

export type PatchShowtimeBodyDTO = z.infer<typeof PatchShowtimeBodyDTOSchema>;

export const DeleteShowtimeParamsDTOSchema = z.object({
  showtime_id: z
    .string()
    .min(1, { message: "Showtime ID is required" })
    .max(100)
    .regex(/^SHW_[\w-]+$/, { message: "Invalid showtime ID format" })
    .transform((value) => new ShowtimeID(value)),
});

export type DeleteShowtimeParamsDTO = z.infer<
  typeof DeleteShowtimeParamsDTOSchema
>;
