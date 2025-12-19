export enum TicketStatus {
  PENDING = "PENDING",
  ISSUED = "ISSUED",
  USED = "USED",
  CANCELLED = "CANCELLED",
}

export class TicketStatusTransition {
  private static readonly VALID_TRANSITIONS: Map<TicketStatus, TicketStatus[]> =
    new Map([
      [TicketStatus.PENDING, [TicketStatus.ISSUED, TicketStatus.CANCELLED]],
      [TicketStatus.ISSUED, [TicketStatus.USED, TicketStatus.CANCELLED]],
      [TicketStatus.USED, []],
      [TicketStatus.CANCELLED, []],
    ]);

  public static canTransition(from: TicketStatus, to: TicketStatus): boolean {
    const validTargets = this.VALID_TRANSITIONS.get(from);
    return validTargets !== undefined && validTargets.includes(to);
  }

  public static isTerminal(status: TicketStatus): boolean {
    return status === TicketStatus.USED || status === TicketStatus.CANCELLED;
  }
}
