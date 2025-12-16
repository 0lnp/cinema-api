import { randomUUID } from "node:crypto";

export class TokenID {
  public constructor(public readonly value: string) {}

  public static generate(): TokenID {
    const id = `TKN_${randomUUID()}`;
    return new TokenID(id);
  }

  public equals(other: TokenID): boolean {
    return this.value === other.value;
  }
}
