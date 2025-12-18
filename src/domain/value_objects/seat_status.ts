export enum SeatStatus {
  AVAILABLE = "AVAILABLE",
  HELD = "HELD",
  RESERVED = "RESERVED",
}

export class SeatStatusTransition {
  private static readonly VALID_TRANSITIONS: Map<SeatStatus, SeatStatus[]> =
    new Map([
      [SeatStatus.AVAILABLE, [SeatStatus.HELD]],
      [SeatStatus.HELD, [SeatStatus.AVAILABLE, SeatStatus.RESERVED]],
      [SeatStatus.RESERVED, [SeatStatus.AVAILABLE]],
    ]);

  public static canTransition(from: SeatStatus, to: SeatStatus): boolean {
    const validTargets = this.VALID_TRANSITIONS.get(from);
    return validTargets !== undefined && validTargets.includes(to);
  }

  public static isOccupied(status: SeatStatus): boolean {
    return status === SeatStatus.HELD || status === SeatStatus.RESERVED;
  }
}
