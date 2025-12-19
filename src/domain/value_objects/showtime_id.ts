import { randomUUID } from "node:crypto";

export class ShowtimeID {
  public constructor(public readonly value: string) {}

  public static generate(): ShowtimeID {
    const id = `SHW_${randomUUID()}`;
    return new ShowtimeID(id);
  }

  public equals(other: ShowtimeID): boolean {
    return this.value === other.value;
  }
}
