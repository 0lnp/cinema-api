import { Module } from "@nestjs/common";
import { EventEmitterModule } from "@nestjs/event-emitter";
import { DomainEventPublisher } from "src/domain/ports/domain_event_publisher";
import { NestEventEmitterAdapter } from "../events/nest_event_emitter_adapter";

@Module({
  imports: [
    EventEmitterModule.forRoot({
      wildcard: false,
      delimiter: ".",
      newListener: false,
      removeListener: false,
      maxListeners: 10,
      verboseMemoryLeak: false,
      ignoreErrors: false,
    }),
  ],
  providers: [
    {
      provide: DomainEventPublisher.name,
      useClass: NestEventEmitterAdapter,
    },
  ],
  exports: [DomainEventPublisher.name],
})
export class EventModule {}
