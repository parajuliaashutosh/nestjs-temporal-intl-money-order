import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateKycApprovalLog1785731940002 implements MigrationInterface {
    name = 'CreateKycApprovalLog1785731940002'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."kyc_approval_log_previous_status_enum" AS ENUM('PENDING', 'VERIFIED', 'REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."kyc_approval_log_new_status_enum" AS ENUM('PENDING', 'VERIFIED', 'REJECTED')`);
        await queryRunner.query(`CREATE TABLE "kyc_approval_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "previous_status" "public"."kyc_approval_log_previous_status_enum" NOT NULL, "new_status" "public"."kyc_approval_log_new_status_enum" NOT NULL, "remark" character varying, "user_id" uuid, "reviewed_by" uuid, CONSTRAINT "PK_6fe00acd449eddd280d229bd9a8" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_47dbc2d05df8e63a07add84811" ON "kyc_approval_log" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "kyc_approval_log" ADD CONSTRAINT "FK_47dbc2d05df8e63a07add84811c" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "kyc_approval_log" ADD CONSTRAINT "FK_07c3d51461a09fbf92ab9418c56" FOREIGN KEY ("reviewed_by") REFERENCES "auth"("id") ON DELETE SET NULL ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "kyc_approval_log" DROP CONSTRAINT "FK_07c3d51461a09fbf92ab9418c56"`);
        await queryRunner.query(`ALTER TABLE "kyc_approval_log" DROP CONSTRAINT "FK_47dbc2d05df8e63a07add84811c"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_47dbc2d05df8e63a07add84811"`);
        await queryRunner.query(`DROP TABLE "kyc_approval_log"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_approval_log_new_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."kyc_approval_log_previous_status_enum"`);
    }

}
