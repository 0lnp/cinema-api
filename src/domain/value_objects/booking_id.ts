import { randomUUID } from "node:crypto";

export class BookingID {
  public constructor(public readonly value: string) {}

  public static generate(): BookingID {
    const id = `BKG_${randomUUID()}`;
    return new BookingID(id);
  }

  public equals(other: BookingID): boolean {
    return this.value === other.value;
  }
}
