import { type ClassProps } from "../types/class_props";

export enum InfrastructureErrorCode {
  PASSWORD_HASHING_FAILED = "PASSWORD_HASHING_FAILED",
  PASSWORD_VERIFICATION_FAILED = "PASSWORD_VERIFICATION_FAILED",
  ID_GENERATION_FAILED = "ID_GENERATION_FAILED",
  JWT_VERIFICATION_FAILED = "JWT_VERIFICATION_FAILED",
  REDIS_CONNECTION_FAILED = "REDIS_CONNECTION_FAILED",
  EXTERNAL_API_TIMEOUT = 'EXTERNAL_API_TIMEOUT',
  EXTERNAL_API_ERROR = 'EXTERNAL_API_ERROR'
}

export class InfrastructureError extends Error {
  public readonly code: InfrastructureErrorCode;
  public override readonly stack?: string | undefined;

  constructor(props: Omit<ClassProps<InfrastructureError>, "cause" | "name">) {
    super(props.message);
    this.code = props.code;
    this.stack = props.stack;
    this.name = this.constructor.name;
  }
}
