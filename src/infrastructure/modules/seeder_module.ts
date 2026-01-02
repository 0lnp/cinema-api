import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RepositoryModule } from "./repository_module";
import { PortModule } from "./port_module";
import { SeederService } from "../seeders/seeder_service";
import { UserSeeder } from "../seeders/user_seeder";
import { CategorySeeder } from "../seeders/category_seeder";
import { SEEDERS_TOKEN } from "../seeders/seeder";
import { AppConfigSchema } from "../configs/app_config";

@Module({
  imports: [
    ConfigModule.forRoot({
      validate(config: Record<string, unknown>) {
        return AppConfigSchema.parse(config);
      },
      isGlobal: true,
    }),
    RepositoryModule,
    PortModule,
  ],
  providers: [
    SeederService,
    UserSeeder,
    CategorySeeder,
    {
      provide: SEEDERS_TOKEN,
      useFactory: (
        userSeeder: UserSeeder,
        categorySeeder: CategorySeeder,
      ) => [userSeeder, categorySeeder],
      inject: [UserSeeder, CategorySeeder],
    },
  ],
  exports: [SeederService],
})
export class SeederModule {}
