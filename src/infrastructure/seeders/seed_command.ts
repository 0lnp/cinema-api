import { NestFactory } from "@nestjs/core";
import { SeederModule } from "../modules/seeder_module";
import { SeederService } from "./seeder_service";

async function bootstrap(): Promise<void> {
  console.log("Initializing seeder application...\n");

  const app = await NestFactory.createApplicationContext(SeederModule, {
    logger: ["error", "warn"],
  });

  try {
    const seederService = app.get(SeederService);
    await seederService.runAll();
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

bootstrap();
