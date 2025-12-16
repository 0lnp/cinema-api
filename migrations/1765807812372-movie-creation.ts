import { MigrationInterface, QueryRunner } from "typeorm";

export class MovieCreation1765807812372 implements MigrationInterface {
  name = "MovieCreation1765807812372";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "movies" (
        "id" character varying NOT NULL,
        "title" character varying NOT NULL,
        "synopsis" text NOT NULL,
        "duration_minutes" numeric NOT NULL,
        "genres" text NOT NULL,
        "certificate" character varying NOT NULL,
        "release_year" numeric NOT NULL,
        "poster_path" character varying NOT NULL,
        "status" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL,
        "created_by" character varying NOT NULL,
        "last_modified_at" TIMESTAMP NOT NULL,
        "deleted_at" TIMESTAMP,
        "deleted_by" character varying,
        CONSTRAINT "PK_c5b2c134e871bfd1c2fe7cc3705" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ADD
        CONSTRAINT "FK_d9bdf4b965d917d35ab4e759f65" FOREIGN KEY ("created_by")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" ADD
        CONSTRAINT "FK_0aab8918b585b011078518b2bda" FOREIGN KEY ("deleted_by")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "movies" DROP
        CONSTRAINT "FK_0aab8918b585b011078518b2bda"`,
    );
    await queryRunner.query(
      `ALTER TABLE "movies" DROP
        CONSTRAINT "FK_d9bdf4b965d917d35ab4e759f65"`,
    );
    await queryRunner.query(`DROP TABLE "movies"`);
  }
}
