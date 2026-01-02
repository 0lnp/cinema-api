import { Module } from "@nestjs/common";
import { EventProvider } from "src/domain/ports/event_provider";
import { TMDBEventProvider } from "../providers/tmdb_event_provider";

@Module({
  providers: [
    {
      provide: EventProvider.name,
      useClass: TMDBEventProvider,
    },
  ],
  exports: [EventProvider.name],
})
export class ProviderModule {}
