import { Module } from "@nestjs/common";
import { ApplicationServiceModule } from "./application_service_module";
import { AuthController } from "src/presentation/controllers/auth_controller";
import { ScreenController } from "src/presentation/controllers/screen_controller";
import { PortModule } from "./port_module";
import { RepositoryModule } from "./repository_module";
import { MovieController } from "src/presentation/controllers/movie_controller";
import { ShowtimeController } from "src/presentation/controllers/showtime_controller";

@Module({
  imports: [ApplicationServiceModule, PortModule, RepositoryModule],
  controllers: [
    AuthController,
    ScreenController,
    MovieController,
    ShowtimeController,
  ],
})
export class ControllerModule {}
