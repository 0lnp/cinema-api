import { MigrationInterface, QueryRunner } from "typeorm";

export class SeatInventoryCreation1766038479942 implements MigrationInterface {
  name = "SeatInventoryCreation1766038479942";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "seat_inventories" (
        "id" character varying NOT NULL,
        "screen_id" character varying NOT NULL,
        "showtime_id" character varying NOT NULL,
        "seats" jsonb NOT NULL,
        "created_at" TIMESTAMP NOT NULL,
        "last_modified_at" TIMESTAMP NOT NULL,
        CONSTRAINT "UQ_d442007a1bf85b2623406f0f855" UNIQUE ("showtime_id"),
        CONSTRAINT "PK_15426e5dad95f451b19d6f58c0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_inventories" ADD
        CONSTRAINT "FK_6afef680b727fed54ff2e445fa0" FOREIGN KEY ("screen_id")
        REFERENCES "screens"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_inventories" ADD
        CONSTRAINT "FK_d442007a1bf85b2623406f0f855" FOREIGN KEY ("showtime_id")
        REFERENCES "showtimes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "seat_inventories" DROP
        CONSTRAINT "FK_d442007a1bf85b2623406f0f855"`,
    );
    await queryRunner.query(
      `ALTER TABLE "seat_inventories" DROP
        CONSTRAINT "FK_6afef680b727fed54ff2e445fa0"`,
    );
    await queryRunner.query(`DROP TABLE "seat_inventories"`);
  }
}
