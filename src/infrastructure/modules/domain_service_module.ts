import { Module } from "@nestjs/common";
import { PortModule } from "./port_module";
import { RepositoryModule } from "./repository_module";
import { TokenManagementService } from "src/domain/services/token_management_service";
import { InfraModule } from "./infra_module";
import { MovieSyncService } from "src/domain/services/movie_sync_service";
import { ProviderModule } from "./provider_module";

@Module({
  imports: [PortModule, RepositoryModule, InfraModule, ProviderModule],
  providers: [
    {
      provide: TokenManagementService.name,
      useClass: TokenManagementService,
    },
    {
      provide: MovieSyncService.name,
      useClass: MovieSyncService,
    },
  ],
  exports: [TokenManagementService.name, MovieSyncService.name],
})
export class DomainServiceModule {}
