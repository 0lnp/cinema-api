import { randomBytes } from "node:crypto";

export class CategoryID {
  public readonly value: string;

  public constructor(value: string) {
    this.value = value;
  }

  public static generate(): CategoryID {
    const id = `CAT_${randomBytes(8).toString("hex")}`;
    return new CategoryID(id);
  }

  public equals(other: CategoryID): boolean {
    return this.value === other.value;
  }
}
