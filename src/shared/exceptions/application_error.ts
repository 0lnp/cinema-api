import { BaseErrorProps } from "src/shared/types/base_error_props";

export enum ApplicationErrorCode {
  ILLEGAL_ARGUMENT = "ILLEGAL_ARGUMENT",
  INVALID_CREDENTIALS = "INVALID_CREDENTIALS",
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
