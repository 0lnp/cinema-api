import { SeatStatus, SeatStatusTransition } from "../value_objects/seat_status";
import { BookingID } from "../value_objects/booking_id";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

interface SeatProps {
  seatNumber: string;
  status: SeatStatus;
  heldBy: BookingID | null;
  heldUntil: Date | null;
}

export class Seat {
  public readonly seatNumber: string;
  private _status: SeatStatus;
  private _heldBy: BookingID | null;
  private _heldUntil: Date | null;

  public constructor(props: SeatProps) {
    this.seatNumber = props.seatNumber;
    this._status = props.status;
    this._heldBy = props.heldBy;
    this._heldUntil = props.heldUntil;
  }

  public static createAvailable(seatNumber: string): Seat {
    return new Seat({
      seatNumber,
      status: SeatStatus.AVAILABLE,
      heldBy: null,
      heldUntil: null,
    });
  }

  public hold(bookingId: BookingID, holdDuration: Date): void {
    if (!SeatStatusTransition.canTransition(this._status, SeatStatus.HELD)) {
      throw new InvariantError({
        code: InvariantErrorCode.SEAT_NOT_AVAILABLE,
        message: `Seat ${this.seatNumber} is not available for holding (current status: ${this._status})`,
      });
    }

    this._status = SeatStatus.HELD;
    this._heldBy = bookingId;
    this._heldUntil = holdDuration;
  }

  public reserve(): void {
    if (
      !SeatStatusTransition.canTransition(this._status, SeatStatus.RESERVED)
    ) {
      throw new InvariantError({
        code: InvariantErrorCode.INVALID_SEAT_TRANSITION,
        message: `Cannot reserve seat ${this.seatNumber} from ${this._status} status`,
      });
    }

    this._status = SeatStatus.RESERVED;
    this._heldUntil = null;
  }

  public release(): void {
    if (
      !SeatStatusTransition.canTransition(this._status, SeatStatus.AVAILABLE)
    ) {
      throw new InvariantError({
        code: InvariantErrorCode.INVALID_SEAT_TRANSITION,
        message: `Cannot release seat ${this.seatNumber} from ${this._status} status`,
      });
    }

    this._status = SeatStatus.AVAILABLE;
    this._heldBy = null;
    this._heldUntil = null;
  }

  public isAvailable(): boolean {
    return this._status === SeatStatus.AVAILABLE;
  }

  public isHeld(): boolean {
    return this._status === SeatStatus.HELD;
  }

  public isReserved(): boolean {
    return this._status === SeatStatus.RESERVED;
  }

  public isHeldExpired(): boolean {
    if (this._status !== SeatStatus.HELD || this._heldUntil === null) {
      return false;
    }
    return new Date() > this._heldUntil;
  }

  public isHeldBy(bookingId: BookingID): boolean {
    return this._heldBy !== null && this._heldBy.value === bookingId.value;
  }

  public get status(): SeatStatus {
    return this._status;
  }

  public get heldBy(): BookingID | null {
    return this._heldBy;
  }

  public get heldUntil(): Date | null {
    return this._heldUntil;
  }
}
