import { randomUUID } from "node:crypto";

export class SeatInventoryID {
  private static readonly PREFIX = "SINV_";

  public constructor(public readonly value: string) {}

  public static generate(): SeatInventoryID {
    return new SeatInventoryID(`${this.PREFIX}${randomUUID()}`);
  }

  public equals(other: SeatInventoryID): boolean {
    return this.value === other.value;
  }
}
