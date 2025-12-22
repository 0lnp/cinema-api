import { Booking } from "../aggregates/booking";
import { BookingID } from "../value_objects/booking_id";
import { BookingStatus } from "../value_objects/booking_status";
import { ShowtimeID } from "../value_objects/showtime_id";
import { UserID } from "../value_objects/user_id";
import { PaginatedQuery, PaginatedResult } from "src/shared/types/pagination";

export type BookingSortField = "createdAt" | "holdExpiresAt" | "status";

export interface BookingSearchFilters {
  customerId?: UserID;
  showtimeId?: ShowtimeID;
  status?: BookingStatus;
}

export abstract class BookingRepository {
  public abstract bookingOfID(id: BookingID): Promise<Booking | null>;
  public abstract bookingOfPaymentReferenceId(
    paymentReferenceId: string,
  ): Promise<Booking | null>;
  public abstract bookingsOfUser(
    userId: UserID,
    query: PaginatedQuery<BookingSortField>,
  ): Promise<PaginatedResult<Booking>>;
  public abstract bookingsOfShowtime(
    showtimeId: ShowtimeID,
  ): Promise<Booking[]>;
  public abstract pendingExpiredBefore(timestamp: Date): Promise<Booking[]>;
  public abstract allBookings(
    query: PaginatedQuery<BookingSortField>,
    filters?: BookingSearchFilters,
  ): Promise<PaginatedResult<Booking>>;
  public abstract nextIdentity(): Promise<BookingID>;
  public abstract save(booking: Booking): Promise<void>;
}
