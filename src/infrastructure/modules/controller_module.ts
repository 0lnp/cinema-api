import { Module } from "@nestjs/common";
import { ApplicationServiceModule } from "./application_service_module";
import { AuthController } from "src/presentation/controllers/auth_controller";
import { ScreenController } from "src/presentation/controllers/screen_controller";
import { PortModule } from "./port_module";
import { RepositoryModule } from "./repository_module";
import { EventController } from "src/presentation/controllers/event_controller";
import { ShowtimeController } from "src/presentation/controllers/showtime_controller";
import { BookingController } from "src/presentation/controllers/booking_controller";
import { WebhookController } from "src/presentation/controllers/webhook_controller";
import { CategoryController } from "src/presentation/controllers/category_controller";

@Module({
  imports: [ApplicationServiceModule, PortModule, RepositoryModule],
  controllers: [
    AuthController,
    ScreenController,
    EventController,
    ShowtimeController,
    BookingController,
    WebhookController,
    CategoryController,
  ],
})
export class ControllerModule {}
