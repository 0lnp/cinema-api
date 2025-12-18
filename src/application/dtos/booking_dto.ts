import { BookingID } from "src/domain/value_objects/booking_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { UserID } from "src/domain/value_objects/user_id";
import { BookingStatus } from "src/domain/value_objects/booking_status";
import { BookingSortField } from "src/domain/repositories/booking_repository";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";
import * as z from "zod";

export const CreateBookingDTOSchema = z.object({
  customerId: z.instanceof(UserID),
  showtimeId: z
    .string()
    .max(100)
    .regex(/^SHW_[\w-]+$/, {
      error: "Invalid showtime ID format",
    })
    .transform((value) => new ShowtimeID(value)),
  seatNumbers: z
    .array(z.string().max(20))
    .min(1, { error: "At least one seat must be selected" }),
});

export type CreateBookingDTO = z.infer<typeof CreateBookingDTOSchema>;

export interface CreateBookingResult {
  message: string;
  bookingId: string;
  showtimeId: string;
  seatNumbers: string[];
  ticketCount: number;
  totalAmount: number;
  serviceFee: number;
  currency: string;
  holdExpiresAt: Date;
  status: string;
  createdAt: Date;
}

export const GetBookingDTOSchema = z.object({
  bookingId: z
    .string()
    .max(100)
    .regex(/^BKG_[\w-]+$/, {
      error: "Invalid booking ID format",
    })
    .transform((value) => new BookingID(value)),
});

export type GetBookingDTO = z.infer<typeof GetBookingDTOSchema>;

export interface BookingTicketInfo {
  seatNumber: string;
  ticketCode: string | null;
  price: number;
  status: string;
}

export interface GetBookingResult {
  id: string;
  customerId: string;
  showtimeId: string;
  movieTitle: string;
  screenName: string;
  startTime: Date;
  endTime: Date;
  tickets: BookingTicketInfo[];
  status: string;
  totalAmount: number;
  serviceFee: number;
  currency: string;
  paymentUrl: string | null;
  invoiceCode: string | null;
  createdAt: Date;
  holdExpiresAt: Date;
  confirmedAt: Date | null;
  checkedInAt: Date | null;
}

export interface GetUserBookingsRequest {
  userId: UserID;
  query: PaginatedQuery<BookingSortField>;
}

export interface BookingListItem {
  id: string;
  showtimeId: string;
  movieTitle: string;
  screenName: string;
  startTime: Date;
  seatCount: number;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
}

export type GetUserBookingsResult = PaginatedResult<BookingListItem>;

export const InitiatePaymentDTOSchema = z.object({
  bookingId: z
    .string()
    .max(100)
    .regex(/^BKG_[\w-]+$/, {
      error: "Invalid booking ID format",
    })
    .transform((value) => new BookingID(value)),
  customerId: z.instanceof(UserID),
});

export type InitiatePaymentDTO = z.infer<typeof InitiatePaymentDTOSchema>;

export interface InitiatePaymentResult {
  message: string;
  bookingId: string;
  paymentUrl: string;
  expiresAt: Date;
}

export interface HandlePaymentCallbackDTO {
  paymentReferenceId: string;
  status: string;
  paymentMethod: string | null;
  paidAt: Date | null;
}

export interface HandlePaymentCallbackResult {
  success: boolean;
  bookingId: string;
  newStatus: string;
}

export const CancelBookingDTOSchema = z.object({
  bookingId: z
    .string()
    .max(100)
    .regex(/^BKG_[\w-]+$/, {
      error: "Invalid booking ID format",
    })
    .transform((value) => new BookingID(value)),
  customerId: z.instanceof(UserID),
});

export type CancelBookingDTO = z.infer<typeof CancelBookingDTOSchema>;

export interface CancelBookingResult {
  message: string;
  bookingId: string;
  cancelledAt: Date;
}

export const GetTicketDownloadLinkDTOSchema = z
  .object({
    bookingId: z
      .string()
      .max(100)
      .regex(/^BKG_[\w-]+$/, {
        error: "Invalid booking ID format",
      })
      .transform((value) => new BookingID(value)),
    customerId: z.instanceof(UserID),
    type: z.enum(["qr_code", "invoice"]),
    seatNumber: z.string().max(20).optional(),
  })
  .refine(
    (data) => {
      if (data.type === "qr_code") {
        return data.seatNumber !== undefined;
      }
      return true;
    },
    {
      error: 'seatNumber is required when type is "qr_code"',
    },
  );

export type GetTicketDownloadLinkDTO = z.infer<
  typeof GetTicketDownloadLinkDTOSchema
>;

export interface GetTicketDownloadLinkResult {
  downloadUrl: string;
  expiresAt: Date;
}

export const GetAllBookingsDTOSchema = z.object({
  customerId: z
    .string()
    .max(100)
    .regex(/^USR_[\w-]+$/, {
      error: "Invalid user ID format",
    })
    .transform((value) => new UserID(value))
    .optional(),
  showtimeId: z
    .string()
    .max(100)
    .regex(/^SHW_[\w-]+$/, {
      error: "Invalid showtime ID format",
    })
    .transform((value) => new ShowtimeID(value))
    .optional(),
  status: z.nativeEnum(BookingStatus).optional(),
});

export type GetAllBookingsFilters = z.infer<typeof GetAllBookingsDTOSchema>;

export interface GetAllBookingsRequest {
  query: PaginatedQuery<BookingSortField>;
  filters?: {
    customerId?: string;
    showtimeId?: string;
    status?: string;
  };
}

export type GetAllBookingsResult = PaginatedResult<BookingListItem>;
