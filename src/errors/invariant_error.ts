export enum InvariantErrorType {
  PASSWORD_STRENGTH_ERROR = "PASSWORD_STRENGTH_ERROR",
  ROLE_ASSIGNING_ERROR = "ROLE_ASSIGNING_ERROR",
}

interface InvariantErrorProps {
  type: InvariantErrorType;
  message: string;
}

export class InvariantError extends Error {
  public readonly type: InvariantErrorType;

  constructor(props: InvariantErrorProps) {
    super(props.message);
    this.name = this.constructor.name;
    this.type = props.type;
  }
}
