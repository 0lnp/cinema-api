export enum BookingStatus {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAYMENT_PROCESSING = "PAYMENT_PROCESSING",
  CONFIRMED = "CONFIRMED",
  CHECKED_IN = "CHECKED_IN",
  CANCELLED = "CANCELLED",
  EXPIRED = "EXPIRED",
}

export class BookingStatusTransition {
  private static readonly allowedTransitions: Record<
    BookingStatus,
    BookingStatus[]
  > = {
    [BookingStatus.PENDING_PAYMENT]: [
      BookingStatus.PAYMENT_PROCESSING,
      BookingStatus.CANCELLED,
      BookingStatus.EXPIRED,
    ],
    [BookingStatus.PAYMENT_PROCESSING]: [
      BookingStatus.CONFIRMED,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.CONFIRMED]: [
      BookingStatus.CHECKED_IN,
      BookingStatus.CANCELLED,
    ],
    [BookingStatus.CHECKED_IN]: [],
    [BookingStatus.CANCELLED]: [],
    [BookingStatus.EXPIRED]: [],
  };

  public static canTransition(from: BookingStatus, to: BookingStatus): boolean {
    return this.allowedTransitions[from].includes(to);
  }

  public static isTerminal(status: BookingStatus): boolean {
    return (
      status === BookingStatus.CHECKED_IN ||
      status === BookingStatus.CANCELLED ||
      status === BookingStatus.EXPIRED
    );
  }

  public static isActive(status: BookingStatus): boolean {
    return (
      status === BookingStatus.PENDING_PAYMENT ||
      status === BookingStatus.PAYMENT_PROCESSING ||
      status === BookingStatus.CONFIRMED ||
      status === BookingStatus.CHECKED_IN
    );
  }

  public static isConfirmed(status: BookingStatus): boolean {
    return (
      status === BookingStatus.CONFIRMED || status === BookingStatus.CHECKED_IN
    );
  }
}
