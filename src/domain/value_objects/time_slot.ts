export class TimeSlot {
  public constructor(
    public readonly timeStart: Date,
    public readonly timeEnd: Date,
  ) {}

  public static create(timeStart: Date, timeEnd: Date): TimeSlot {
    if (timeStart.getTime() >= timeEnd.getTime()) {
      throw new Error("Time slot start must be before end");
    }

    return new TimeSlot(timeStart, timeEnd);
  }

  public overlaps(other: TimeSlot): boolean {
    const timeDistanceMs = 15 * 60 * 1000; // 15 minutes in milliseconds
    return (
      this.timeStart.getTime() <= other.timeEnd.getTime() + timeDistanceMs &&
      this.timeEnd.getTime() + timeDistanceMs >= other.timeStart.getTime()
    );
  }
}
