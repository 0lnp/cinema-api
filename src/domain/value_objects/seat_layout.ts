export interface SeatRow {
  label: string;
  seatCount: number;
}

export class SeatLayout {
  private constructor(
    public readonly rows: SeatRow[],
    public readonly totalSeats: number,
  ) {}

  public static create(rows: SeatRow[]): SeatLayout {
    if (rows.length === 0) {
      throw new Error("Invalid rows");
    }

    const totalSeats = rows.reduce((acc, row) => acc + row.seatCount, 0);

    return new SeatLayout(rows, totalSeats);
  }

  public getAllSeatNumbers(): string[] {
    const seatNumbers: string[] = [];
    for (const row of this.rows) {
      for (let i = 1; i <= row.seatCount; i++) {
        seatNumbers.push(`${row.label}${i}`);
      }
    }
    return seatNumbers;
  }
}
