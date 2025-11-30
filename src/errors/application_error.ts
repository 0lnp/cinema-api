import { type BaseErrorProps } from "src/shared/types/base_error_props";

export enum ApplicationErrorType {
  EMAIL_DUPLICATE_ERROR = "EMAIL_DUPLICATE_ERROR",
  EMAIL_NOT_FOUND_ERROR = "EMAIL_NOT_FOUND_ERROR",
  PASSWORD_INVALID_ERROR = "PASSWORD_INVALID_ERROR",
}

export class ApplicationError extends Error {
  public readonly type: ApplicationErrorType;

  constructor(props: BaseErrorProps<ApplicationErrorType>) {
    super(props.message);
    this.name = this.constructor.name;
    this.type = props.type;
  }
}
