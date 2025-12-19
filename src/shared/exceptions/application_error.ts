import { type BaseErrorProps } from "src/shared/types/base_error_props";

export enum ApplicationErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  INVALID_JWT_TOKEN = "INVALID_JWT_TOKEN",
  TOKEN_REUSE_DETECTED = "TOKEN_REUSE_DETECTED",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  EXPIRED_JWT_TOKEN = "EXPIRED_JWT_TOKEN",
  SHOWTIME_CONFLICT = "SHOWTIME_CONFLICT",
  RESOURCE_NOT_FOUND = "RESOURCE_NOT_FOUND",
  INVALID_INPUT = "INVALID_INPUT",
  INVALID_REQUEST = "INVALID_REQUEST",
  SHOWTIME_NOT_AVAILABLE = "SHOWTIME_NOT_AVAILABLE",
  SHOWTIME_IN_PAST = "SHOWTIME_IN_PAST",
  SEATS_NOT_AVAILABLE = "SEATS_NOT_AVAILABLE",
  INVALID_SEAT_SELECTION = "INVALID_SEAT_SELECTION",
  BOOKING_EXPIRED = "BOOKING_EXPIRED",
  INVALID_BOOKING_STATE = "INVALID_BOOKING_STATE",
  TICKET_NOT_GENERATED = "TICKET_NOT_GENERATED",
  INVALID_WEBHOOK_SIGNATURE = "INVALID_WEBHOOK_SIGNATURE",
}

export class ApplicationError extends Error {
  public readonly code: ApplicationErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(props: BaseErrorProps<ApplicationError>) {
    super(props.message);
    this.code = props.code;
    this.details = props.details;
    this.name = this.constructor.name;
  }
}
