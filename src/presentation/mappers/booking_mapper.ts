import { type BaseSuccessfulResponse } from "src/shared/types/base_successful_response";
import {
  PostBookingBodyDTO,
  PostBookingCancelParamsDTO,
  PostBookingPaymentParamsDTO,
  GetTicketDownloadParamsDTO,
  GetTicketDownloadQueryDTO,
} from "../dtos/booking_dto";
import {
  CancelBookingDTO,
  CancelBookingResult,
  CreateBookingResult,
  GetAllBookingsResult,
  GetBookingResult,
  GetTicketDownloadLinkDTO,
  GetTicketDownloadLinkResult,
  GetUserBookingsResult,
  InitiatePaymentDTO,
  InitiatePaymentResult,
} from "src/application/dtos/booking_dto";
import { ShowtimeID } from "src/domain/value_objects/showtime_id";

export interface CreateBookingResponse {
  booking_id: string;
  showtime_id: string;
  seat_numbers: string[];
  ticket_count: number;
  total_amount: number;
  service_fee: number;
  currency: string;
  hold_expires_at: string;
  status: string;
  created_at: string;
}

export interface BookingTicketResponse {
  seat_number: string;
  ticket_code: string | null;
  price: number;
  status: string;
}

export interface GetBookingResponse {
  id: string;
  customer_id: string;
  showtime_id: string;
  movie_title: string;
  screen_name: string;
  start_time: string;
  end_time: string;
  tickets: BookingTicketResponse[];
  status: string;
  total_amount: number;
  service_fee: number;
  currency: string;
  payment_url: string | null;
  invoice_code: string | null;
  created_at: string;
  hold_expires_at: string;
  confirmed_at: string | null;
  checked_in_at: string | null;
}

export interface BookingListItemResponse {
  id: string;
  showtime_id: string;
  movie_title: string;
  screen_name: string;
  start_time: string;
  seat_count: number;
  status: string;
  total_amount: number;
  currency: string;
  created_at: string;
}

export interface GetAllBookingsResponse {
  items: BookingListItemResponse[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface InitiatePaymentResponse {
  booking_id: string;
  payment_url: string;
  expires_at: string;
}

export interface CancelBookingResponse {
  booking_id: string;
  cancelled_at: string;
}

export interface TicketDownloadLinkResponse {
  download_url: string;
  expires_at: string;
}

export class BookingMapper {
  public static toCreateRequest(body: PostBookingBodyDTO): {
    showtimeId: ShowtimeID;
    seatNumbers: string[];
  } {
    return {
      showtimeId: body.showtime_id,
      seatNumbers: body.seat_ids,
    };
  }

  public static toCreateResponse(
    result: CreateBookingResult,
  ): BaseSuccessfulResponse<CreateBookingResponse> {
    return {
      message: result.message,
      data: {
        booking_id: result.bookingId,
        showtime_id: result.showtimeId,
        seat_numbers: result.seatNumbers,
        ticket_count: result.ticketCount,
        total_amount: result.totalAmount,
        service_fee: result.serviceFee,
        currency: result.currency,
        hold_expires_at: result.holdExpiresAt.toISOString(),
        status: result.status,
        created_at: result.createdAt.toISOString(),
      },
    };
  }

  public static toGetResponse(
    result: GetBookingResult,
  ): BaseSuccessfulResponse<GetBookingResponse> {
    return {
      message: "Booking retrieved successfully",
      data: {
        id: result.id,
        customer_id: result.customerId,
        showtime_id: result.showtimeId,
        movie_title: result.movieTitle,
        screen_name: result.screenName,
        start_time: result.startTime.toISOString(),
        end_time: result.endTime.toISOString(),
        tickets: result.tickets.map((ticket) => ({
          seat_number: ticket.seatNumber,
          ticket_code: ticket.ticketCode,
          price: ticket.price,
          status: ticket.status,
        })),
        status: result.status,
        total_amount: result.totalAmount,
        service_fee: result.serviceFee,
        currency: result.currency,
        payment_url: result.paymentUrl,
        invoice_code: result.invoiceCode,
        created_at: result.createdAt.toISOString(),
        hold_expires_at: result.holdExpiresAt.toISOString(),
        confirmed_at: result.confirmedAt?.toISOString() ?? null,
        checked_in_at: result.checkedInAt?.toISOString() ?? null,
      },
    };
  }

  public static toGetAllResponse(
    result: GetAllBookingsResult | GetUserBookingsResult,
  ): BaseSuccessfulResponse<GetAllBookingsResponse> {
    return {
      message: "Bookings retrieved successfully",
      data: {
        items: result.items.map((item) => ({
          id: item.id,
          showtime_id: item.showtimeId,
          movie_title: item.movieTitle,
          screen_name: item.screenName,
          start_time: item.startTime.toISOString(),
          seat_count: item.seatCount,
          status: item.status,
          total_amount: item.totalAmount,
          currency: item.currency,
          created_at: item.createdAt.toISOString(),
        })),
        total: result.total,
        page: result.page,
        limit: result.limit,
        total_pages: result.totalPages,
      },
    };
  }

  public static toInitiatePaymentRequest(
    params: PostBookingPaymentParamsDTO,
  ): Omit<InitiatePaymentDTO, "customerId"> {
    return {
      bookingId: params.booking_id,
    };
  }

  public static toInitiatePaymentResponse(
    result: InitiatePaymentResult,
  ): BaseSuccessfulResponse<InitiatePaymentResponse> {
    return {
      message: result.message,
      data: {
        booking_id: result.bookingId,
        payment_url: result.paymentUrl,
        expires_at: result.expiresAt.toISOString(),
      },
    };
  }

  public static toCancelRequest(
    params: PostBookingCancelParamsDTO,
  ): Omit<CancelBookingDTO, "customerId"> {
    return {
      bookingId: params.booking_id,
    };
  }

  public static toCancelResponse(
    result: CancelBookingResult,
  ): BaseSuccessfulResponse<CancelBookingResponse> {
    return {
      message: result.message,
      data: {
        booking_id: result.bookingId,
        cancelled_at: result.cancelledAt.toISOString(),
      },
    };
  }

  public static toTicketDownloadRequest(
    params: GetTicketDownloadParamsDTO,
    query: GetTicketDownloadQueryDTO,
  ): Omit<GetTicketDownloadLinkDTO, "customerId"> {
    return {
      bookingId: params.booking_id,
      type: query.type,
      seatNumber: query.seat_number,
    };
  }

  public static toTicketDownloadResponse(
    result: GetTicketDownloadLinkResult,
  ): BaseSuccessfulResponse<TicketDownloadLinkResponse> {
    return {
      message: "Download link generated successfully",
      data: {
        download_url: result.downloadUrl,
        expires_at: result.expiresAt.toISOString(),
      },
    };
  }
}
