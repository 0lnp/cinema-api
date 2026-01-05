import { Module } from "@nestjs/common";
import { PortModule } from "./port_module";
import { RepositoryModule } from "./repository_module";
import { TokenManagementService } from "src/domain/services/token_management_service";
import { InfraModule } from "./infra_module";
import { EventSyncService } from "src/domain/services/event_sync_service";
import { ProviderModule } from "./provider_module";

@Module({
  imports: [PortModule, RepositoryModule, InfraModule, ProviderModule],
  providers: [
    {
      provide: TokenManagementService.name,
      useClass: TokenManagementService,
    },
    {
      provide: EventSyncService.name,
      useClass: EventSyncService,
    },
  ],
  exports: [TokenManagementService.name, EventSyncService.name],
})
export class DomainServiceModule {}
