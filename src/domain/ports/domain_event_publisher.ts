import { DomainEvent } from "../events/domain_event";

export abstract class DomainEventPublisher {
  public abstract publish(event: DomainEvent): void;
  public abstract publishAll(events: DomainEvent[]): void;
}
