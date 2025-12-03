import { Module } from "@nestjs/common";
import { ApplicationServiceModule } from "./application_service_module";
import { AuthController } from "src/presentation/controllers/auth_controller";

@Module({
  imports: [ApplicationServiceModule],
  controllers: [AuthController],
})
export class AuthModule {}
