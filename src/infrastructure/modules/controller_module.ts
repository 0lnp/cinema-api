import { Module } from "@nestjs/common";
import { ApplicationServiceModule } from "./application_service_module";
import { AuthController } from "src/presentation/controllers/auth_controller";
import { PortModule } from "./port_module";
import { RepositoryModule } from "./repository_module";

@Module({
  imports: [ApplicationServiceModule, PortModule, RepositoryModule],
  controllers: [AuthController],
})
export class ControllerModule {}
