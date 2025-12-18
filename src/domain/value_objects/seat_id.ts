import { randomUUID } from "node:crypto";

export class SeatID {
  public constructor(public readonly value: string) {}

  public static generate(): SeatID {
    const id = `SEAT_${randomUUID()}`;
    return new SeatID(id);
  }

  public static fromRowAndNumber(row: string, seatNumber: number): SeatID {
    return new SeatID(`${row}${seatNumber}`);
  }

  public equals(other: SeatID): boolean {
    return this.value === other.value;
  }
}
