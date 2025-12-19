import { createHash } from "node:crypto";
import { BookingID } from "../value_objects/booking_id";
import { UserID } from "../value_objects/user_id";
import { ShowtimeID } from "../value_objects/showtime_id";
import {
  BookingStatus,
  BookingStatusTransition,
} from "../value_objects/booking_status";
import { Money } from "../value_objects/money";
import { PaymentDetails } from "../value_objects/payment_details";
import { BookingInvoice } from "../value_objects/ticket";
import { BookingTicket } from "../entities/booking_ticket";
import { StoragePath } from "../value_objects/storage_path";
import {
  InvariantError,
  InvariantErrorCode,
} from "src/shared/exceptions/invariant_error";

interface TicketInfo {
  seatNumber: string;
  price: Money;
}

interface BookingCreateProps {
  id: BookingID;
  customerId: UserID;
  showtimeId: ShowtimeID;
  holdExpiresAt: Date;
  ticketInfos: TicketInfo[];
  serviceFee: Money;
}

interface BookingProps {
  id: BookingID;
  customerId: UserID;
  showtimeId: ShowtimeID;
  tickets: BookingTicket[];
  status: BookingStatus;
  serviceFee: Money;
  paymentDetails: PaymentDetails | null;
  invoice: BookingInvoice | null;
  qrCodeHash: string | null;
  createdAt: Date;
  holdExpiresAt: Date;
  confirmedAt: Date | null;
  cancelledAt: Date | null;
  checkedInAt: Date | null;
}

export class Booking {
  public readonly id: BookingID;
  public readonly customerId: UserID;
  public readonly showtimeId: ShowtimeID;
  private _tickets: BookingTicket[];
  private _status: BookingStatus;
  public readonly serviceFee: Money;
  private _paymentDetails: PaymentDetails | null;
  private _invoice: BookingInvoice | null;
  private _qrCodeHash: string | null;
  public readonly createdAt: Date;
  public readonly holdExpiresAt: Date;
  private _confirmedAt: Date | null;
  private _cancelledAt: Date | null;
  private _checkedInAt: Date | null;

  public constructor(props: BookingProps) {
    this.id = props.id;
    this.customerId = props.customerId;
    this.showtimeId = props.showtimeId;
    this._tickets = props.tickets;
    this._status = props.status;
    this.serviceFee = props.serviceFee;
    this._paymentDetails = props.paymentDetails;
    this._invoice = props.invoice;
    this._qrCodeHash = props.qrCodeHash;
    this.createdAt = props.createdAt;
    this.holdExpiresAt = props.holdExpiresAt;
    this._confirmedAt = props.confirmedAt;
    this._cancelledAt = props.cancelledAt;
    this._checkedInAt = props.checkedInAt;
  }

  public static create(props: BookingCreateProps): Booking {
    if (props.ticketInfos.length === 0) {
      throw new InvariantError({
        code: InvariantErrorCode.BOOKING_MINIMUM_SEATS,
        message: "A booking must contain at least one seat",
      });
    }

    const tickets = props.ticketInfos.map((info) =>
      BookingTicket.create(info.seatNumber, info.price),
    );

    const now = new Date();
    return new Booking({
      id: props.id,
      customerId: props.customerId,
      showtimeId: props.showtimeId,
      tickets,
      status: BookingStatus.PENDING_PAYMENT,
      serviceFee: props.serviceFee,
      paymentDetails: null,
      invoice: null,
      qrCodeHash: null,
      createdAt: now,
      holdExpiresAt: props.holdExpiresAt,
      confirmedAt: null,
      cancelledAt: null,
      checkedInAt: null,
    });
  }

  public initiatePayment(paymentReferenceId: string, paymentUrl: string): void {
    this.assertCanTransitionTo(BookingStatus.PAYMENT_PROCESSING);
    this._status = BookingStatus.PAYMENT_PROCESSING;
    this._paymentDetails = PaymentDetails.create(
      paymentReferenceId,
      paymentUrl,
    );
  }

  public confirmPayment(paymentMethod: string): void {
    this.assertCanTransitionTo(BookingStatus.CONFIRMED);

    if (this._paymentDetails === null) {
      throw new InvariantError({
        code: InvariantErrorCode.PAYMENT_NOT_INITIATED,
        message: "Cannot confirm payment that was not initiated",
      });
    }

    this._status = BookingStatus.CONFIRMED;
    this._paymentDetails = this._paymentDetails.withPaymentCompleted(
      paymentMethod,
      new Date(),
    );
    this._confirmedAt = new Date();

    this._qrCodeHash = this.generateQRCodeHash();
  }

  public issueTickets(qrCodePaths: Map<string, StoragePath>): void {
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new InvariantError({
        code: InvariantErrorCode.TICKET_GENERATION_NOT_ALLOWED,
        message: "Tickets can only be issued for confirmed bookings",
      });
    }

    for (const ticket of this._tickets) {
      const qrCodePath = qrCodePaths.get(ticket.seatNumber);
      if (qrCodePath === undefined) {
        throw new InvariantError({
          code: InvariantErrorCode.TICKET_GENERATION_NOT_ALLOWED,
          message: `QR code path not provided for seat ${ticket.seatNumber}`,
        });
      }

      const ticketCode = this.generateTicketCode(ticket.seatNumber);
      ticket.issue(ticketCode, qrCodePath);
    }
  }

  public attachInvoice(invoicePath: StoragePath): void {
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new InvariantError({
        code: InvariantErrorCode.TICKET_GENERATION_NOT_ALLOWED,
        message: "Invoice can only be attached to confirmed bookings",
      });
    }

    if (this._invoice !== null) {
      throw new InvariantError({
        code: InvariantErrorCode.TICKET_ALREADY_GENERATED,
        message: "Invoice has already been generated for this booking",
      });
    }

    this._invoice = BookingInvoice.create(invoicePath);
  }

  public checkIn(): void {
    if (this._status !== BookingStatus.CONFIRMED) {
      throw new InvariantError({
        code: InvariantErrorCode.BOOKING_NOT_CONFIRMED,
        message: "Can only check in confirmed bookings",
      });
    }

    this.assertCanTransitionTo(BookingStatus.CHECKED_IN);

    for (const ticket of this._tickets) {
      if (ticket.isIssued()) {
        ticket.use();
      }
    }

    this._status = BookingStatus.CHECKED_IN;
    this._checkedInAt = new Date();
  }

  public checkInTicket(seatNumber: string): void {
    if (!BookingStatusTransition.isConfirmed(this._status)) {
      throw new InvariantError({
        code: InvariantErrorCode.BOOKING_NOT_CONFIRMED,
        message: "Can only check in tickets for confirmed bookings",
      });
    }

    const ticket = this._tickets.find((t) => t.seatNumber === seatNumber);
    if (ticket === undefined) {
      throw new InvariantError({
        code: InvariantErrorCode.TICKET_INVALID_STATUS,
        message: `Ticket for seat ${seatNumber} not found`,
      });
    }

    ticket.use();

    if (this._tickets.every((t) => t.isUsed())) {
      this._status = BookingStatus.CHECKED_IN;
      this._checkedInAt = new Date();
    }
  }

  public cancel(): void {
    if (BookingStatusTransition.isTerminal(this._status)) {
      throw new InvariantError({
        code: InvariantErrorCode.BOOKING_ALREADY_TERMINAL,
        message: `Cannot cancel booking in ${this._status} status`,
      });
    }

    this._status = BookingStatus.CANCELLED;
    this._cancelledAt = new Date();

    for (const ticket of this._tickets) {
      if (ticket.isPending() || ticket.isIssued()) {
        ticket.cancel();
      }
    }
  }

  public expire(): void {
    if (this._status !== BookingStatus.PENDING_PAYMENT) {
      throw new InvariantError({
        code: InvariantErrorCode.BOOKING_CANNOT_EXPIRE,
        message: `Cannot expire booking in ${this._status} status`,
      });
    }

    this._status = BookingStatus.EXPIRED;

    for (const ticket of this._tickets) {
      if (ticket.isPending()) {
        ticket.cancel();
      }
    }
  }

  public isHoldExpired(): boolean {
    return (
      this._status === BookingStatus.PENDING_PAYMENT &&
      Date.now() > this.holdExpiresAt.getTime()
    );
  }

  public isActive(): boolean {
    return BookingStatusTransition.isActive(this._status);
  }

  private assertCanTransitionTo(targetStatus: BookingStatus): void {
    if (!BookingStatusTransition.canTransition(this._status, targetStatus)) {
      throw new InvariantError({
        code: InvariantErrorCode.INVALID_BOOKING_TRANSITION,
        message: `Cannot transition from ${this._status} to ${targetStatus}`,
      });
    }
  }

  private generateQRCodeHash(): string {
    const data = `${this.id.value}:${this.customerId.value}:${
      this.showtimeId.value
    }:${Date.now()}`;
    return createHash("sha256").update(data).digest("hex").substring(0, 16);
  }

  private generateTicketCode(seatNumber: string): string {
    const prefix = this.id.value.substring(4, 8).toUpperCase();
    const seatSuffix = seatNumber.replace(/[^A-Za-z0-9]/g, "").toUpperCase();
    return `TKT-${prefix}-${seatSuffix}`;
  }

  public get totalAmount(): Money {
    const ticketTotal = this._tickets.reduce(
      (sum, ticket) => sum + ticket.price.amount,
      0,
    );
    return Money.create(
      ticketTotal + this.serviceFee.amount,
      this.serviceFee.currency,
    );
  }

  public get ticketSubtotal(): Money {
    const total = this._tickets.reduce(
      (sum, ticket) => sum + ticket.price.amount,
      0,
    );
    return Money.create(total, this.serviceFee.currency);
  }

  public get seatNumbers(): string[] {
    return this._tickets.map((t) => t.seatNumber);
  }

  public get ticketCount(): number {
    return this._tickets.length;
  }

  public get status(): BookingStatus {
    return this._status;
  }

  public get tickets(): readonly BookingTicket[] {
    return this._tickets;
  }

  public get paymentDetails(): PaymentDetails | null {
    return this._paymentDetails;
  }

  public get invoice(): BookingInvoice | null {
    return this._invoice;
  }

  public get qrCodeHash(): string | null {
    return this._qrCodeHash;
  }

  public get confirmedAt(): Date | null {
    return this._confirmedAt;
  }

  public get cancelledAt(): Date | null {
    return this._cancelledAt;
  }

  public get checkedInAt(): Date | null {
    return this._checkedInAt;
  }

  public getTicket(seatNumber: string): BookingTicket | undefined {
    return this._tickets.find((t) => t.seatNumber === seatNumber);
  }

  public getIssuedTickets(): BookingTicket[] {
    return this._tickets.filter((t) => t.isIssued());
  }

  public getUsedTickets(): BookingTicket[] {
    return this._tickets.filter((t) => t.isUsed());
  }

  public areAllTicketsIssued(): boolean {
    return this._tickets.every((t) => t.isIssued() || t.isUsed());
  }
}
