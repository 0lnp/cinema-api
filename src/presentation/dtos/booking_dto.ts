import { BookingStatus } from "src/domain/value_objects/booking_status";
import { PaginatedQueryRaw } from "../pipes/parse_paginated_query_pipe";

export interface PostBookingBodyDTO {
  showtime_id: string;
  seat_ids: string[];
}

export interface GetBookingParamsDTO {
  booking_id: string;
}

export interface GetBookingsQueryDTO extends PaginatedQueryRaw {
  user_id?: string;
  showtime_id?: string;
  status?: BookingStatus;
}

export interface PostBookingPaymentParamsDTO {
  booking_id: string;
}

export interface PostBookingCancelParamsDTO {
  booking_id: string;
}

export interface GetTicketDownloadParamsDTO {
  booking_id: string;
}

export interface GetTicketDownloadQueryDTO {
  type: "qr_code" | "invoice";
  seat_number?: string;
}

export interface XenditWebhookBodyDTO {
  id: string;
  external_id: string;
  status: string;
  payment_method?: string;
  paid_at?: string;
  amount: number;
  [key: string]: unknown;
}
