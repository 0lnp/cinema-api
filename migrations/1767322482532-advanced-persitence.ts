import { MigrationInterface, QueryRunner } from "typeorm";

export class AdvancedPersitence1767322482532 implements MigrationInterface {
    name = 'AdvancedPersitence1767322482532'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`ALTER TABLE "showtimes" DROP CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759"`);
        await queryRunner.query(`ALTER TABLE "showtimes" RENAME COLUMN "movie_id" TO "event_id"`);
        await queryRunner.query(`CREATE TABLE "categories" ("id" character varying NOT NULL, "name" character varying(100) NOT NULL, "parent_id" character varying, "path" character varying(500) NOT NULL, "level" integer NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "events" ("id" character varying NOT NULL, "type" character varying NOT NULL, "title" character varying NOT NULL, "description" text NOT NULL, "duration_minutes" numeric NOT NULL, "genres" text NOT NULL, "poster_path" character varying, "certificate" character varying, "release_year" numeric, "status" character varying NOT NULL, "created_at" TIMESTAMP NOT NULL, "created_by" character varying NOT NULL, "last_modified_at" TIMESTAMP NOT NULL, "deleted_at" TIMESTAMP, "deleted_by" character varying, "category_id" character varying, "categoryId" character varying, CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "user_profiles" ("user_id" character varying NOT NULL, "full_name" character varying(200) NOT NULL, "phone_number" character varying(20), "address" text, "created_at" TIMESTAMP NOT NULL, CONSTRAINT "PK_6ca9503d77ae39b4b5a6cc3ba88" PRIMARY KEY ("user_id"))`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "categories" ADD CONSTRAINT "FK_88cea2dc9c31951d06437879b40" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_2f7107d3528147b9237b6e2a2fe" FOREIGN KEY ("categoryId") REFERENCES "categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_1a259861a2ce114f074b366eed2" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_37b9122b451dc010dd3c7bbde4c" FOREIGN KEY ("deleted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "showtimes" ADD CONSTRAINT "FK_6c4115f27a99d828544c11dcef4" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_profiles" ADD CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_profiles" DROP CONSTRAINT "FK_6ca9503d77ae39b4b5a6cc3ba88"`);
        await queryRunner.query(`ALTER TABLE "showtimes" DROP CONSTRAINT "FK_6c4115f27a99d828544c11dcef4"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_37b9122b451dc010dd3c7bbde4c"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_1a259861a2ce114f074b366eed2"`);
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_2f7107d3528147b9237b6e2a2fe"`);
        await queryRunner.query(`ALTER TABLE "categories" DROP CONSTRAINT "FK_88cea2dc9c31951d06437879b40"`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" DROP CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4"`);
        await queryRunner.query(`DROP TABLE "user_profiles"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TABLE "categories"`);
        await queryRunner.query(`ALTER TABLE "showtimes" RENAME COLUMN "event_id" TO "movie_id"`);
        await queryRunner.query(`ALTER TABLE "showtimes" ADD CONSTRAINT "FK_cbe689b0c116fbc866d8ea21759" FOREIGN KEY ("movie_id") REFERENCES "movies"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "refresh_tokens" ADD CONSTRAINT "FK_3ddc983c5f7bcf132fd8732c3f4" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

}
