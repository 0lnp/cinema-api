import { BookingID } from "src/domain/value_objects/booking_id";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";
import { UserID } from "src/domain/value_objects/user_id";
import { BookingStatus } from "src/domain/value_objects/booking_status";
import { BookingSortField } from "src/domain/repositories/booking_repository";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export interface CreateBookingDTO {
  customerId: UserID;
  showtimeId: ShowtimeID;
  seatNumbers: string[];
}

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

export interface GetBookingDTO {
  bookingId: BookingID;
}

export interface BookingTicketInfo {
  seatNumber: string;
  ticketCode: string | null;
  price: number;
  status: string;
}

export interface GetBookingResult {
  message: string;
  id: string;
  customerId: string;
  showtimeId: string;
  eventTitle: string;
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
  eventTitle: string;
  screenName: string;
  startTime: Date;
  seatCount: number;
  status: string;
  totalAmount: number;
  currency: string;
  createdAt: Date;
}

export type GetUserBookingsResult = PaginatedResult<BookingListItem> & {
  message: string;
};

export interface InitiatePaymentDTO {
  bookingId: BookingID;
  customerId: UserID;
}

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
  message: string;
  success: boolean;
  bookingId: string;
  newStatus: string;
}

export interface CancelBookingDTO {
  bookingId: BookingID;
  customerId: UserID;
}

export interface CancelBookingResult {
  message: string;
  bookingId: string;
  cancelledAt: Date;
}

export interface GetTicketDownloadLinkDTO {
  bookingId: BookingID;
  customerId: UserID;
  type: "qr_code" | "invoice";
  seatNumber?: string | undefined;
}

export interface GetTicketDownloadLinkResult {
  message: string;
  downloadUrl: string;
  expiresAt: Date;
}

export interface GetAllBookingsFilters {
  customerId?: UserID;
  showtimeId?: ShowtimeID;
  status?: BookingStatus;
}

export interface GetAllBookingsRequest {
  query: PaginatedQuery<BookingSortField>;
  filters?: {
    customerId?: UserID;
    showtimeId?: ShowtimeID;
    status?: BookingStatus;
  };
}

export type GetAllBookingsResult = PaginatedResult<BookingListItem> & {
  message: string;
};
