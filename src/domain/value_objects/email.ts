import {
  InvariantError,
  InvariantErrorCode,
} from "../../shared/exceptions/invariant_error";

export class Email {
  public constructor(public readonly value: string) {}

  public static create(value: string): Email {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value)) {
      throw new InvariantError({
        code: InvariantErrorCode.INVALID_EMAIL_FORMAT,
        message: "Invalid email format",
      });
    }

    const normalizedEmail = value.toLowerCase().trim();
    return new Email(normalizedEmail);
  }

  public equals(other: Email): boolean {
    return this.value === other.value;
  }
}
