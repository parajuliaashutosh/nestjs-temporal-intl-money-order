import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLedgerReconciliation1793620266972 implements MigrationInterface {
    name = 'CreateLedgerReconciliation1793620266972'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ledger_reconciliation_status_enum" AS ENUM('PASSED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "ledger_reconciliation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "status" "public"."ledger_reconciliation_status_enum" NOT NULL, "accounts_checked" integer NOT NULL, "journals_checked" integer NOT NULL, "wallets_pending_opening" integer NOT NULL, "break_count" integer NOT NULL, "breaks" jsonb NOT NULL, "duration_ms" integer NOT NULL, CONSTRAINT "PK_08b6f8d87eebe2400465f3e6756" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "ledger_reconciliation"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_reconciliation_status_enum"`);
    }

}
