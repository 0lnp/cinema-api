import { randomUUID } from "node:crypto";

export class UserID {
  public constructor(public readonly value: string) {}

  public static generate(): UserID {
    const id = `user_${randomUUID()}`;
    return new UserID(id);
  }

  public equals(other: UserID): boolean {
    return this.value === other.value;
  }
}
