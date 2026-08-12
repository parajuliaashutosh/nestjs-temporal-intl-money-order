import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateSystemConfigLogAndDropActivityLog1785819000888 implements MigrationInterface {
    name = 'CreateSystemConfigLogAndDropActivityLog1785819000888'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."system_config_log_action_enum" AS ENUM('CREATE', 'UPDATE')`);
        await queryRunner.query(`CREATE TABLE "system_config_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "previous_value" jsonb, "new_value" jsonb NOT NULL, "action" "public"."system_config_log_action_enum" NOT NULL, "system_config_id" uuid, "changed_by" uuid, CONSTRAINT "PK_9aa8bf2b69c52462821f798e06a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_99beb0a21b0d65897459447fdf" ON "system_config_log" ("system_config_id") `);
        await queryRunner.query(`ALTER TABLE "system_config_log" ADD CONSTRAINT "FK_99beb0a21b0d65897459447fdfb" FOREIGN KEY ("system_config_id") REFERENCES "system_config"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "system_config_log" ADD CONSTRAINT "FK_b6fbac814cee540956e3f38b746" FOREIGN KEY ("changed_by") REFERENCES "auth"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
        await queryRunner.query(`DROP TABLE "activity_log"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "activity_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity" character varying NOT NULL, "entityId" character varying NOT NULL, "action" character varying NOT NULL, "authId" character varying, "payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "system_config_log" DROP CONSTRAINT "FK_b6fbac814cee540956e3f38b746"`);
        await queryRunner.query(`ALTER TABLE "system_config_log" DROP CONSTRAINT "FK_99beb0a21b0d65897459447fdfb"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_99beb0a21b0d65897459447fdf"`);
        await queryRunner.query(`DROP TABLE "system_config_log"`);
        await queryRunner.query(`DROP TYPE "public"."system_config_log_action_enum"`);
    }

}
