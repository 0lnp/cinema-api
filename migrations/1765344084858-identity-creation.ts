import { MigrationInterface, QueryRunner } from "typeorm";

export class IdentityCreation1765344084858 implements MigrationInterface {
  name = "IdentityCreation1765344084858";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "users" (
        "id" character varying NOT NULL,
        "display_name" character varying(100) NOT NULL,
        "email" character varying(100) NOT NULL,
        "password_hash" character varying NOT NULL,
        "role_name" character varying NOT NULL,
        "last_login_at" TIMESTAMP,
        "registered_at" TIMESTAMP NOT NULL,
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `CREATE TABLE "refresh_tokens" (
        "id" character varying NOT NULL,
        "user_id" character varying NOT NULL,
        "token_hash" character varying NOT NULL,
        "token_family" character varying NOT NULL,
        "issued_at" TIMESTAMP NOT NULL,
        "expires_at" TIMESTAMP NOT NULL,
        "status" character varying NOT NULL,
        CONSTRAINT "PK_7d8bee0204106019488c4c50ffa" PRIMARY KEY ("id")
      )`,
    );
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" ADD
        CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id")
        REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "refresh_tokens" DROP
        CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`,
    );
    await queryRunner.query(`DROP TABLE "refresh_tokens"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
