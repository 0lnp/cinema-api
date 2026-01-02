import { Inject, Injectable } from "@nestjs/common";
import { Seeder, SEEDERS_TOKEN } from "./seeder";

@Injectable()
export class SeederService {
  public constructor(
    @Inject(SEEDERS_TOKEN)
    private readonly seeders: Seeder[],
  ) {}

  public async runAll(): Promise<void> {
    const sorted = [...this.seeders].sort((a, b) => a.order - b.order);

    console.log(`\n Starting database seeding...`);
    console.log(`Found ${sorted.length} seeders to run.\n`);

    for (const seeder of sorted) {
      console.log(`[${seeder.order}] Running ${seeder.name}...`);
      const start = Date.now();

      await seeder.seed();

      const duration = Date.now() - start;
      console.log(`\t - ${seeder.name} completed in ${duration}ms`);
    }

    console.log(`\n All seeders completed successfully!\n`);
  }

  public async runOne(name: string): Promise<void> {
    const seeder = this.seeders.find((s) => s.name === name);

    if (!seeder) {
      throw new Error(`Seeder "${name}" not found`);
    }

    console.log(`Running seeder: ${seeder.name}...`);
    await seeder.seed();
    console.log(`${seeder.name} completed!`);
  }
}
