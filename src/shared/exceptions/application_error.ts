import { type BaseErrorProps } from "src/shared/types/base_error_props";

export enum ApplicationErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  VALIDATION_ERROR = "VALIDATION_ERROR",
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  INVALID_JWT_TOKEN = "INVALID_JWT_TOKEN",
  TOKEN_REUSE_DETECTED = "TOKEN_REUSE_DETECTED",
  INVALID_REFRESH_TOKEN = "INVALID_REFRESH_TOKEN",
  EXPIRED_JWT_TOKEN = "EXPIRED_JWT_TOKEN",
  SCREEN_NOT_FOUND = "SCREEN_NOT_FOUND",
  MOVIE_NOT_FOUND = "MOVIE_NOT_FOUND",
}

export class ApplicationError extends Error {
  public readonly code: ApplicationErrorCode;
  public readonly details?: Record<string, unknown>;

  constructor(props: BaseErrorProps<ApplicationError>) {
    super(props.message);
    this.code = props.code;
    this.details = props.details || {};
    this.name = this.constructor.name;
  }
}
