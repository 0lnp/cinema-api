import { BookingStatus } from "src/domain/value_objects/booking_status";
import * as z from "zod";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { BookingID } from "src/domain/value_objects/booking_id";
import { UserID } from "src/domain/value_objects/user_id";
import { PaginatedQueryDTOSchema } from "./shared_dto";

export const PostBookingBodyDTOSchema = z.object({
  showtime_id: z
    .string()
    .min(1, { message: "Showtime ID is required" })
    .max(100)
    .regex(/^SHW_[\w-]+$/, { message: "Invalid showtime ID format" })
    .transform((value) => new ShowtimeID(value)),
  seat_ids: z
    .array(z.string().min(1).max(20))
    .min(1, { message: "At least one seat must be selected" }),
});

export type PostBookingBodyDTO = z.infer<typeof PostBookingBodyDTOSchema>;

export const GetBookingParamsDTOSchema = z.object({
  booking_id: z
    .string()
    .min(1, { message: "Booking ID is required" })
    .max(100)
    .regex(/^BKG_[\w-]+$/, { message: "Invalid booking ID format" })
    .transform((value) => new BookingID(value)),
});

export type GetBookingParamsDTO = z.infer<typeof GetBookingParamsDTOSchema>;

export const GetBookingsQueryDTOSchema = z.intersection(
  z.object({
    user_id: z
      .string()
      .max(100)
      .regex(/^USR_[\w-]+$/, { message: "Invalid user ID format" })
      .transform((value) => new UserID(value))
      .optional(),
    showtime_id: z
      .string()
      .max(100)
      .regex(/^SHW_[\w-]+$/, { message: "Invalid showtime ID format" })
      .transform((value) => new ShowtimeID(value))
      .optional(),
    status: z.enum(BookingStatus).optional(),
  }),
  PaginatedQueryDTOSchema,
);

export type GetBookingsQueryDTO = z.infer<typeof GetBookingsQueryDTOSchema>;

export const GetUserBookingsQueryDTOSchema = z.intersection(
  z.object({
    user_id: z
      .string()
      .max(100)
      .regex(/^USR_[\w-]+$/, { message: "Invalid user ID format" })
      .transform((value) => new UserID(value)),
  }),
  PaginatedQueryDTOSchema,
);

export type GetUserBookingsQueryDTO = z.infer<
  typeof GetUserBookingsQueryDTOSchema
>;

export const PostBookingPaymentParamsDTOSchema = z.object({
  booking_id: z
    .string()
    .min(1, { message: "Booking ID is required" })
    .max(100)
    .regex(/^BKG_[\w-]+$/, { message: "Invalid booking ID format" })
    .transform((value) => new BookingID(value)),
});

export type PostBookingPaymentParamsDTO = z.infer<
  typeof PostBookingPaymentParamsDTOSchema
>;

export const PostBookingCancelParamsDTOSchema = z.object({
  booking_id: z
    .string()
    .min(1, { message: "Booking ID is required" })
    .max(100)
    .regex(/^BKG_[\w-]+$/, { message: "Invalid booking ID format" })
    .transform((value) => new BookingID(value)),
});

export type PostBookingCancelParamsDTO = z.infer<
  typeof PostBookingCancelParamsDTOSchema
>;

export const GetTicketDownloadParamsDTOSchema = z.object({
  booking_id: z
    .string()
    .min(1, { message: "Booking ID is required" })
    .max(100)
    .regex(/^BKG_[\w-]+$/, { message: "Invalid booking ID format" })
    .transform((value) => new BookingID(value)),
});

export type GetTicketDownloadParamsDTO = z.infer<
  typeof GetTicketDownloadParamsDTOSchema
>;

export const GetTicketDownloadQueryDTOSchema = z
  .object({
    type: z.enum(["qr_code", "invoice"], {
      message: 'Type must be either "qr_code" or "invoice"',
    }),
    seat_number: z.string().max(20).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "qr_code") {
        return data.seat_number !== undefined && data.seat_number.length > 0;
      }
      return true;
    },
    {
      message: 'seat_number is required when type is "qr_code"',
    },
  );

export type GetTicketDownloadQueryDTO = z.infer<
  typeof GetTicketDownloadQueryDTOSchema
>;

export const XenditWebhookBodyDTOSchema = z
  .object({
    id: z.string(),
    external_id: z.string().nullable(),
    status: z.string(),
    payment_method: z.string(),
    paid_at: z.iso.datetime(),
    amount: z.number(),
  })
  .loose();

export type XenditWebhookBodyDTO = z.infer<typeof XenditWebhookBodyDTOSchema>;
