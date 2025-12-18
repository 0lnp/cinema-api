import { randomUUID } from "node:crypto";
import {
  TicketStatus,
  TicketStatusTransition,
} from "../value_objects/ticket_status";
import { Money } from "../value_objects/money";
import { StoragePath } from "../value_objects/storage_path";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

interface BookingTicketProps {
  id: string;
  seatNumber: string;
  price: Money;
  status: TicketStatus;
  qrCode: StoragePath | null;
  ticketCode: string | null;
  issuedAt: Date | null;
  usedAt: Date | null;
}

export class BookingTicket {
  public readonly id: string;
  public readonly seatNumber: string;
  public readonly price: Money;
  private _status: TicketStatus;
  private _qrCode: StoragePath | null;
  private _ticketCode: string | null;
  private _issuedAt: Date | null;
  private _usedAt: Date | null;

  public constructor(props: BookingTicketProps) {
    this.id = props.id;
    this.seatNumber = props.seatNumber;
    this.price = props.price;
    this._status = props.status;
    this._qrCode = props.qrCode;
    this._ticketCode = props.ticketCode;
    this._issuedAt = props.issuedAt;
    this._usedAt = props.usedAt;
  }

  public static create(seatNumber: string, price: Money): BookingTicket {
    return new BookingTicket({
      id: randomUUID(),
      seatNumber,
      price,
      status: TicketStatus.PENDING,
      qrCode: null,
      ticketCode: null,
      issuedAt: null,
      usedAt: null,
    });
  }

  public issue(ticketCode: string, qrCode: StoragePath): void {
    if (
      !TicketStatusTransition.canTransition(this._status, TicketStatus.ISSUED)
    ) {
      throw new InvariantError({
        code: InvariantErrorCode.TICKET_INVALID_STATUS,
        message: `Cannot issue ticket in ${this._status} status`,
      });
    }

    this._status = TicketStatus.ISSUED;
    this._ticketCode = ticketCode;
    this._qrCode = qrCode;
    this._issuedAt = new Date();
  }

  public use(): void {
    if (
      !TicketStatusTransition.canTransition(this._status, TicketStatus.USED)
    ) {
      throw new InvariantError({
        code: InvariantErrorCode.TICKET_ALREADY_USED,
        message:
          this._status === TicketStatus.USED
            ? "Ticket has already been used"
            : `Cannot use ticket in ${this._status} status`,
      });
    }

    this._status = TicketStatus.USED;
    this._usedAt = new Date();
  }

  public cancel(): void {
    if (
      !TicketStatusTransition.canTransition(
        this._status,
        TicketStatus.CANCELLED,
      )
    ) {
      throw new InvariantError({
        code: InvariantErrorCode.TICKET_INVALID_STATUS,
        message: `Cannot cancel ticket in ${this._status} status`,
      });
    }

    this._status = TicketStatus.CANCELLED;
  }

  public isPending(): boolean {
    return this._status === TicketStatus.PENDING;
  }

  public isIssued(): boolean {
    return this._status === TicketStatus.ISSUED;
  }

  public isUsed(): boolean {
    return this._status === TicketStatus.USED;
  }

  public isCancelled(): boolean {
    return this._status === TicketStatus.CANCELLED;
  }

  public get status(): TicketStatus {
    return this._status;
  }

  public get qrCode(): StoragePath | null {
    return this._qrCode;
  }

  public get ticketCode(): string | null {
    return this._ticketCode;
  }

  public get issuedAt(): Date | null {
    return this._issuedAt;
  }

  public get usedAt(): Date | null {
    return this._usedAt;
  }
}
