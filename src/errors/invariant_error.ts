import { type BaseErrorProps } from "src/shared/types/base_error_props";

export enum InvariantErrorType {
  PASSWORD_STRENGTH_ERROR = "PASSWORD_STRENGTH_ERROR",
  ROLE_ASSIGNING_ERROR = "ROLE_ASSIGNING_ERROR",
}

export class InvariantError extends Error {
  public readonly type: InvariantErrorType;

  constructor(props: BaseErrorProps<InvariantErrorType>) {
    super(props.message);
    this.name = this.constructor.name;
    this.type = props.type;
  }
}
