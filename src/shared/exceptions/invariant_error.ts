import { BaseErrorProps } from "src/shared/types/base_error_props";

export enum InvariantErrorCode {
  // Value object creation
  INVALID_EMAIL_FORMAT = "INVALID_EMAIL_FORMAT",

  // User
  EMAIL_ALREADY_EXISTS = "EMAIL_ALREADY_EXISTS",
  ROLE_ASSIGNMENT_FAILED = "ROLE_ASSIGNMENT_FAILED",
}

export class InvariantError extends Error {
  public readonly code: InvariantErrorCode;

  constructor(props: BaseErrorProps<InvariantError>) {
    super(props.message);
    this.code = props.code;
    this.name = this.constructor.name;
  }
}
