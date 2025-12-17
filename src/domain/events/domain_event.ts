export abstract class DomainEvent {
  public readonly occurredOn: Date;
  public readonly eventVersion: number;

  protected constructor() {
    this.occurredOn = new Date();
    this.eventVersion = 1;
  }

  public abstract get eventName(): string;
}
