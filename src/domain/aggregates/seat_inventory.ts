import { SeatInventoryID } from "../value_objects/seat_inventory_id";
import { ScreenID } from "../value_objects/screen_id";
import { ShowtimeID } from "../value_objects/showtime_id";
import { BookingID } from "../value_objects/booking_id";
import { Seat } from "../entities/seat";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

interface SeatInventoryCreateProps {
  id: SeatInventoryID;
  screenId: ScreenID;
  showtimeId: ShowtimeID;
  seatNumbers: string[];
}

interface SeatInventoryProps {
  id: SeatInventoryID;
  screenId: ScreenID;
  showtimeId: ShowtimeID;
  seats: Map<string, Seat>;
  createdAt: Date;
  lastModifiedAt: Date;
}

export class SeatInventory {
  public readonly id: SeatInventoryID;
  public readonly screenId: ScreenID;
  public readonly showtimeId: ShowtimeID;
  private _seats: Map<string, Seat>;
  public readonly createdAt: Date;
  private _lastModifiedAt: Date;

  public constructor(props: SeatInventoryProps) {
    this.id = props.id;
    this.screenId = props.screenId;
    this.showtimeId = props.showtimeId;
    this._seats = props.seats;
    this.createdAt = props.createdAt;
    this._lastModifiedAt = props.lastModifiedAt;
  }

  public static create(props: SeatInventoryCreateProps): SeatInventory {
    if (props.seatNumbers.length === 0) {
      throw new InvariantError({
        code: InvariantErrorCode.SEAT_INVENTORY_EMPTY,
        message: "Seat inventory must contain at least one seat",
      });
    }

    const seats = new Map<string, Seat>();
    for (const seatNumber of props.seatNumbers) {
      seats.set(seatNumber, Seat.createAvailable(seatNumber));
    }

    const now = new Date();
    return new SeatInventory({
      id: props.id,
      screenId: props.screenId,
      showtimeId: props.showtimeId,
      seats,
      createdAt: now,
      lastModifiedAt: now,
    });
  }

  public holdSeats(
    seatNumbers: string[],
    bookingId: BookingID,
    holdUntil: Date,
  ): void {
    for (const seatNumber of seatNumbers) {
      const seat = this._seats.get(seatNumber);
      if (seat === undefined) {
        throw new InvariantError({
          code: InvariantErrorCode.SEAT_NOT_AVAILABLE,
          message: `Seat ${seatNumber} does not exist in this inventory`,
        });
      }
      if (!seat.isAvailable()) {
        throw new InvariantError({
          code: InvariantErrorCode.SEAT_NOT_AVAILABLE,
          message: `Seat ${seatNumber} is not available (status: ${seat.status})`,
        });
      }
    }

    for (const seatNumber of seatNumbers) {
      const seat = this._seats.get(seatNumber)!;
      seat.hold(bookingId, holdUntil);
    }

    this._lastModifiedAt = new Date();
  }

  public reserveSeats(seatNumbers: string[], bookingId: BookingID): void {
    for (const seatNumber of seatNumbers) {
      const seat = this._seats.get(seatNumber);
      if (seat === undefined) {
        throw new InvariantError({
          code: InvariantErrorCode.SEAT_NOT_AVAILABLE,
          message: `Seat ${seatNumber} does not exist in this inventory`,
        });
      }
      if (!seat.isHeldBy(bookingId)) {
        throw new InvariantError({
          code: InvariantErrorCode.SEAT_NOT_HELD_BY_BOOKING,
          message: `Seat ${seatNumber} is not held by booking ${bookingId.value}`,
        });
      }
    }

    for (const seatNumber of seatNumbers) {
      const seat = this._seats.get(seatNumber)!;
      seat.reserve();
    }

    this._lastModifiedAt = new Date();
  }

  public releaseSeats(seatNumbers: string[], bookingId: BookingID): void {
    for (const seatNumber of seatNumbers) {
      const seat = this._seats.get(seatNumber);
      if (seat === undefined) {
        continue; // Seat doesn't exist, skip silently
      }
      if (!seat.isHeldBy(bookingId)) {
        continue; // Seat not held by this booking, skip
      }
      seat.release();
    }

    this._lastModifiedAt = new Date();
  }

  public releaseExpiredHolds(): BookingID[] {
    const releasedBookings = new Set<string>();

    for (const seat of this._seats.values()) {
      if (seat.isHeldExpired() && seat.heldBy !== null) {
        releasedBookings.add(seat.heldBy.value);
        seat.release();
      }
    }

    if (releasedBookings.size > 0) {
      this._lastModifiedAt = new Date();
    }

    return Array.from(releasedBookings).map((id) => new BookingID(id));
  }

  public getAvailableSeats(): Seat[] {
    return Array.from(this._seats.values()).filter((seat) =>
      seat.isAvailable(),
    );
  }

  public getHeldSeats(): Seat[] {
    return Array.from(this._seats.values()).filter((seat) => seat.isHeld());
  }

  public getReservedSeats(): Seat[] {
    return Array.from(this._seats.values()).filter((seat) => seat.isReserved());
  }

  public getSeat(seatNumber: string): Seat | undefined {
    return this._seats.get(seatNumber);
  }

  public getSeatsForBooking(bookingId: BookingID): Seat[] {
    return Array.from(this._seats.values()).filter((seat) =>
      seat.isHeldBy(bookingId),
    );
  }

  public areSeatNumbersValid(seatNumbers: string[]): boolean {
    return seatNumbers.every((sn) => this._seats.has(sn));
  }

  public areSeatNumbersAvailable(seatNumbers: string[]): boolean {
    return seatNumbers.every((sn) => {
      const seat = this._seats.get(sn);
      return seat !== undefined && seat.isAvailable();
    });
  }

  public get seats(): Map<string, Seat> {
    return new Map(this._seats);
  }

  public get totalSeats(): number {
    return this._seats.size;
  }

  public get availableCount(): number {
    return this.getAvailableSeats().length;
  }

  public get heldCount(): number {
    return this.getHeldSeats().length;
  }

  public get reservedCount(): number {
    return this.getReservedSeats().length;
  }

  public get lastModifiedAt(): Date {
    return this._lastModifiedAt;
  }
}
