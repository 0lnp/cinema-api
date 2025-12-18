import { MigrationInterface, QueryRunner } from "typeorm";

export class BookingCreation1766038523206 implements MigrationInterface {
  name = "BookingCreation1766038523206";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "bookings" (
        "id" character varying NOT NULL,
        "customer_id" character varying NOT NULL,
        "showtime_id" character varying NOT NULL,
        "tickets" jsonb NOT NULL,
        "status" character varying NOT NULL,
        "service_fee" jsonb NOT NULL,
        "payment_details" jsonb,
        "invoice" jsonb,
        "qr_code_hash" character varying,
        "created_at" TIMESTAMP NOT NULL,
        "hold_expires_at" TIMESTAMP NOT NULL,
        "confirmed_at" TIMESTAMP,
        "cancelled_at" TIMESTAMP,
        "checked_in_at" TIMESTAMP,
        CONSTRAINT "PK_bee6805982cc1e248e94ce94957" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD
        CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f" FOREIGN KEY ("customer_id")
        REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" ADD
        CONSTRAINT "FK_311925ef3f94966ea9482de9df3" FOREIGN KEY ("showtime_id")
        REFERENCES "showtimes"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP
        CONSTRAINT "FK_311925ef3f94966ea9482de9df3"`,
    );
    await queryRunner.query(
      `ALTER TABLE "bookings" DROP
        CONSTRAINT "FK_8e21b7ae33e7b0673270de4146f"`,
    );
    await queryRunner.query(`DROP TABLE "bookings"`);
  }
}
