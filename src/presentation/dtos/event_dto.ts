import { EventCertificate } from "src/domain/value_objects/event_certificate";
import { EventID } from "src/domain/value_objects/event_id";
import { EventStatus } from "src/domain/value_objects/event_status";
import { EventType } from "src/domain/value_objects/event_type";
import { PaginatedQueryDTOSchema } from "./shared_dto";
import * as z from "zod";

export const PostEventBodyDTOSchema = z.object({
  type: z.enum(EventType, { message: "Invalid event type" }),
  title: z
    .string()
    .min(1, { message: "Title is required" })
    .max(200, { message: "Title must be at most 200 characters" }),
  description: z
    .string()
    .min(1, { message: "Description is required" })
    .max(2000, { message: "Description must be at most 2000 characters" }),
  duration_minutes: z
    .number()
    .min(1, { message: "Duration must be at least 1 minute" }),
  genres: z.array(z.string().max(50)).min(1, { message: "At least one genre is required" }),
  poster_path: z.string().max(200).nullable(),
  certificate: z.enum(EventCertificate, { message: "Invalid certificate" }).nullable(),
  release_year: z.number().min(1900).nullable(),
});

export type PostEventBodyDTO = z.infer<typeof PostEventBodyDTOSchema>;

export const GetEventsQueryDTOSchema = z.intersection(
  z.object({
    status: z.enum(EventStatus).optional(),
    genre: z.string().max(50).optional(),
    release_year: z.coerce.number().min(1900).optional(),
  }),
  PaginatedQueryDTOSchema,
);

export type GetEventsQueryDTO = z.infer<typeof GetEventsQueryDTOSchema>;

export const GetEventSearchExternalQueryDTOSchema = z.object({
  v: z
    .string()
    .min(2, { message: "Search keyword must be at least 2 characters" })
    .max(255, { message: "Search keyword must be at most 255 characters" }),
});

export type GetEventSearchExternalQueryDTO = z.infer<typeof GetEventSearchExternalQueryDTOSchema>;

export const PostEventSyncBodyDTOSchema = z.object({
  external_id: z
    .string()
    .min(1, { message: "External ID is required" }),
});

export type PostEventSyncBodyDTO = z.infer<typeof PostEventSyncBodyDTOSchema>;

export const PatchEventIDParamsDTOSchema = z.object({
  event_id: z
    .string()
    .min(1, { message: "Event ID is required" })
    .max(100)
    .regex(/^EVT_[\w-]+$/, { message: "Invalid event ID format" })
    .transform((value) => new EventID(value)),
});

export type PatchEventIDParamsDTO = z.infer<typeof PatchEventIDParamsDTOSchema>;

export const PatchEventIDBodyDTOSchema = z.object({
  status: z.enum(EventStatus, {
    message: "Invalid status value",
  }),
});

export type PatchEventIDBodyDTO = z.infer<typeof PatchEventIDBodyDTOSchema>;

export const DeleteEventParamsDTOSchema = z.object({
  event_id: z
    .string()
    .min(1, { message: "Event ID is required" })
    .max(100)
    .regex(/^EVT_[\w-]+$/, { message: "Invalid event ID format" })
    .transform((value) => new EventID(value)),
});

export type DeleteEventParamsDTO = z.infer<typeof DeleteEventParamsDTOSchema>;

// Generic Event ID params schema (for category management etc.)
export const EventIdParamsDTOSchema = z.object({
  event_id: z
    .string()
    .min(1, { message: "Event ID is required" })
    .regex(/^EVT_[\w-]+$/, { message: "Invalid event ID format" })
    .transform((value) => new EventID(value)),
});

export type EventIdParamsDTO = z.infer<typeof EventIdParamsDTOSchema>;

// Category management schemas
export const SetCategoryBodyDTOSchema = z.object({
  category_id: z
    .string()
    .regex(/^CAT_[\w-]+$/, { message: "Invalid category ID format" })
    .nullable(),
});

export type SetCategoryBodyDTO = z.infer<typeof SetCategoryBodyDTOSchema>;
