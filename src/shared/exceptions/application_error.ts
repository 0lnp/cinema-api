import { BaseErrorProps } from "src/shared/types/base_error_props";

export enum ApplicationErrorCode {
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
  VALIDATION_ERROR = "VALIDATION_ERROR",
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
