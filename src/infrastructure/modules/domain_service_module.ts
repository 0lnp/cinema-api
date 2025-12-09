import { Module } from "@nestjs/common";
import { PortsModule } from "./ports_module";
import { RepositoryModule } from "./repository_module";
import { TokenManagementService } from "src/domain/services/token_management_service";

@Module({
  imports: [PortsModule, RepositoryModule],
  providers: [
    {
      provide: TokenManagementService.name,
      useClass: TokenManagementService,
    },
  ],
  exports: [TokenManagementService.name],
})
export class DomainServiceModule {}
