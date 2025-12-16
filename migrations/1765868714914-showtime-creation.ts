import { MigrationInterface, QueryRunner } from "typeorm";

export class ShowtimeCreation1765868714914 implements MigrationInterface {
  name = "ShowtimeCreation1765868714914";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "showtimes" (
        "id" character varying NOT NULL,
        "movie_id" character varying NOT NULL,
        "screen_id" character varying NOT NULL,
        "time_start" TIMESTAMP NOT NULL,
        "time_end" TIMESTAMP NOT NULL,
        "pricing" jsonb NOT NULL,
        "status" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL,
        "created_by" character varying NOT NULL,
        "last_modified_at" TIMESTAMP NOT NULL,
        "deleted_at" TIMESTAMP,
        "deleted_by" character varying,
        CONSTRAINT "PK_2d979092e692ec1a7b505893ee2" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" ADD
        CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759" FOREIGN KEY ("movie_id")
        REFERENCES "movies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" ADD
        CONSTRAINT "FK_e6f9a9f85ec5ff721f3f89e9d69" FOREIGN KEY ("screen_id")
        REFERENCES "screens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" ADD
        CONSTRAINT "FK_d78ec33f3de366d8e6fcab32146" FOREIGN KEY ("created_by")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" ADD
        CONSTRAINT "FK_ea307419cfa25987babad2a03cf" FOREIGN KEY ("deleted_by")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP
        CONSTRAINT "FK_ea307419cfa25987babad2a03cf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP
        CONSTRAINT "FK_d78ec33f3de366d8e6fcab32146"`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP
        CONSTRAINT "FK_e6f9a9f85ec5ff721f3f89e9d69"`,
    );
    await queryRunner.query(
      `ALTER TABLE "showtimes" DROP
        CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759"`,
    );
    await queryRunner.query(`DROP TABLE "showtimes"`);
  }
}
