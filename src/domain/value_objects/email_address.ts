import {
  InvariantError,
  InvariantErrorCode,
} from "../../shared/exceptions/invariant_error";

export class EmailAddress {
  public constructor(public readonly value: string) {
    if (!this.isValidEmail(value)) {
      throw new InvariantError({
        code: InvariantErrorCode.INVALID_EMAIL_FORMAT,
        message: "Invalid email format",
      });
    }
    this.value = value.toLowerCase();
  }

  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
