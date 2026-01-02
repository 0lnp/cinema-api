export interface Seeder {
  readonly name: string;
  readonly order: number;
  
  seed(): Promise<void>;
}

export const SEEDERS_TOKEN = "SEEDERS";
