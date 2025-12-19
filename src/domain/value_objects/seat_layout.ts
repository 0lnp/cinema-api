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
}
