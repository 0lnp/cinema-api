import { Injectable } from "@nestjs/common";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { DomainEventPublisher } from "src/domain/ports/domain_event_publisher";
import { DomainEvent } from "src/domain/events/domain_event";

@Injectable()
export class NestEventEmitterAdapter implements DomainEventPublisher {
  public constructor(private readonly eventEmitter: EventEmitter2) {}

  public publish(event: DomainEvent): void {
    this.eventEmitter.emit(event.eventName, event);
  }

  public publishAll(events: DomainEvent[]): void {
    for (const event of events) {
      this.publish(event);
    }
  }
}
