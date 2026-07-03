import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1783092249369 implements MigrationInterface {
    name = 'InitSchema1783092249369'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "users" ("id" uuid NOT NULL, "email" character varying(320) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."event_type" AS ENUM('user_signed_up', 'subscription_created', 'payment_success', 'payment_failed', 'churn_detected')`);
        await queryRunner.query(`CREATE TABLE "events" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."event_type" NOT NULL, "user_id" uuid NOT NULL, "payload" jsonb, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_40731c7151fe4be3116e45ddf73" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5c751ba5c02239663b81996563" ON "events"  ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_7ebab07668bb225b6a04782a7d" ON "events"  ("created_at") `);
        await queryRunner.query(`CREATE TYPE "public"."metric_type" AS ENUM('mrr', 'arr', 'churn_rate', 'conversion_rate', 'active_users')`);
        await queryRunner.query(`CREATE TABLE "metrics" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."metric_type" NOT NULL, "value" double precision NOT NULL, "computed_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_5283cad666a83376e28a715bf0e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a8795b8fa77f435e792e7bba83" ON "metrics"  ("type") `);
        await queryRunner.query(`CREATE INDEX "IDX_d3f282b0b7cde9d55e0005f0d7" ON "metrics"  ("computed_at") `);
        await queryRunner.query(`ALTER TABLE "events" ADD CONSTRAINT "FK_09f256fb7f9a05f0ed9927f406b" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "events" DROP CONSTRAINT "FK_09f256fb7f9a05f0ed9927f406b"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_d3f282b0b7cde9d55e0005f0d7"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a8795b8fa77f435e792e7bba83"`);
        await queryRunner.query(`DROP TABLE "metrics"`);
        await queryRunner.query(`DROP TYPE "public"."metric_type"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7ebab07668bb225b6a04782a7d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5c751ba5c02239663b81996563"`);
        await queryRunner.query(`DROP TABLE "events"`);
        await queryRunner.query(`DROP TYPE "public"."event_type"`);
        await queryRunner.query(`DROP TABLE "users"`);
    }

}
