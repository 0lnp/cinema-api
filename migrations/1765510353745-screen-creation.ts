import { MigrationInterface, QueryRunner } from "typeorm";

export class ScreenCreation1765510353745 implements MigrationInterface {
  name = "ScreenCreation1765510353745";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "screens" (
        "id" character varying NOT NULL,
        "name" character varying(100) NOT NULL,
        "seat_rows" jsonb NOT NULL,
        "capacity" numeric NOT NULL,
        "created_by" character varying NOT NULL,
        "created_at" TIMESTAMP NOT NULL,
        "last_modified_at" TIMESTAMP NOT NULL,
        "deleted_at" TIMESTAMP,
        "deleted_by" character varying,
        CONSTRAINT "PK_15b65ed44367c5411efccdd7de1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "screens" ADD
        CONSTRAINT "FK_94fbf5ca4622cf9796c789b17fc" FOREIGN KEY ("created_by")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "screens" ADD
        CONSTRAINT "FK_f044bfd93d479780c2376ee9a29" FOREIGN KEY ("deleted_by")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "screens" DROP
        CONSTRAINT "FK_f044bfd93d479780c2376ee9a29"`,
    );
    await queryRunner.query(
      `ALTER TABLE "screens" DROP
        CONSTRAINT "FK_94fbf5ca4622cf9796c789b17fc"`,
    );
    await queryRunner.query(`DROP TABLE "screens"`);
  }
}
