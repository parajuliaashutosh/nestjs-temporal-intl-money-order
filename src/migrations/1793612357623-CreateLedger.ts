import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateLedger1793612357623 implements MigrationInterface {
    name = 'CreateLedger1793612357623'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."ledger_account_type_enum" AS ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE')`);
        await queryRunner.query(`CREATE TYPE "public"."ledger_account_currency_enum" AS ENUM('USD', 'AUD')`);
        await queryRunner.query(`CREATE TABLE "ledger_account" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "code" character varying NOT NULL, "type" "public"."ledger_account_type_enum" NOT NULL, "currency" "public"."ledger_account_currency_enum" NOT NULL, "balance" bigint NOT NULL DEFAULT '0', "allow_negative" boolean NOT NULL DEFAULT false, "wallet_id" uuid, "version" integer NOT NULL, CONSTRAINT "UQ_cb2ceafed631e8bfa859548d22b" UNIQUE ("code"), CONSTRAINT "REL_b1f65eb3d18dc7436ffc0731c6" UNIQUE ("wallet_id"), CONSTRAINT "CHK_e1948936a553ce33fcd01a1271" CHECK ("allow_negative" OR "balance" >= 0), CONSTRAINT "PK_34640393ff83dad2b4627d7ae5f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."ledger_entry_side_enum" AS ENUM('DEBIT', 'CREDIT')`);
        await queryRunner.query(`CREATE TYPE "public"."ledger_entry_currency_enum" AS ENUM('USD', 'AUD')`);
        await queryRunner.query(`CREATE TABLE "ledger_entry" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "side" "public"."ledger_entry_side_enum" NOT NULL, "amount" bigint NOT NULL, "currency" "public"."ledger_entry_currency_enum" NOT NULL, "balance_after" bigint NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "journal_id" uuid NOT NULL, "account_id" uuid NOT NULL, CONSTRAINT "CHK_d0723de9ca03fcc8816e447fda" CHECK ("amount" > 0), CONSTRAINT "PK_04e9d274911f909a5848a15cd74" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_081cfd83eb0c774575b864f023" ON "ledger_entry" ("journal_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_a24ff8a49f06d921a4e6311254" ON "ledger_entry" ("account_id", "created_at") `);
        await queryRunner.query(`CREATE TYPE "public"."ledger_journal_type_enum" AS ENUM('WALLET_OPENING_BALANCE', 'WALLET_TOP_UP', 'MONEY_ORDER_FUNDING', 'MONEY_ORDER_PAYOUT')`);
        await queryRunner.query(`CREATE TABLE "ledger_journal" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "type" "public"."ledger_journal_type_enum" NOT NULL, "idempotency_key" character varying NOT NULL, "reference" character varying, "description" character varying, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_bb877049ea137aff8215ce63d81" UNIQUE ("idempotency_key"), CONSTRAINT "PK_faebbfe5795d9db5c03a71c0f4a" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_0b3bdfb6dca043b0ece2caae64" ON "ledger_journal" ("reference") `);
        await queryRunner.query(`ALTER TABLE "ledger_account" ADD CONSTRAINT "FK_b1f65eb3d18dc7436ffc0731c66" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledger_entry" ADD CONSTRAINT "FK_081cfd83eb0c774575b864f0237" FOREIGN KEY ("journal_id") REFERENCES "ledger_journal"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "ledger_entry" ADD CONSTRAINT "FK_f51c20726076921b4697f67a8c1" FOREIGN KEY ("account_id") REFERENCES "ledger_account"("id") ON DELETE RESTRICT ON UPDATE NO ACTION`);

        await queryRunner.query(`
            CREATE FUNCTION ledger_entry_immutable() RETURNS trigger AS $$
            BEGIN
                RAISE EXCEPTION 'ledger_entry rows are append-only';
            END;
            $$ LANGUAGE plpgsql
        `);
        await queryRunner.query(`CREATE TRIGGER ledger_entry_immutable BEFORE UPDATE OR DELETE ON "ledger_entry" FOR EACH ROW EXECUTE FUNCTION ledger_entry_immutable()`);

        await queryRunner.query(`
            CREATE FUNCTION ledger_journal_must_balance() RETURNS trigger AS $$
            DECLARE
                unbalanced record;
            BEGIN
                SELECT currency, SUM(CASE WHEN side = 'DEBIT' THEN amount ELSE -amount END) AS net
                  INTO unbalanced
                  FROM ledger_entry
                 WHERE journal_id = NEW.journal_id
                 GROUP BY currency
                HAVING SUM(CASE WHEN side = 'DEBIT' THEN amount ELSE -amount END) <> 0
                 LIMIT 1;

                IF FOUND THEN
                    RAISE EXCEPTION 'ledger journal % is unbalanced in % by %', NEW.journal_id, unbalanced.currency, unbalanced.net;
                END IF;

                RETURN NULL;
            END;
            $$ LANGUAGE plpgsql
        `);
        await queryRunner.query(`CREATE CONSTRAINT TRIGGER ledger_journal_must_balance AFTER INSERT ON "ledger_entry" DEFERRABLE INITIALLY DEFERRED FOR EACH ROW EXECUTE FUNCTION ledger_journal_must_balance()`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TRIGGER ledger_journal_must_balance ON "ledger_entry"`);
        await queryRunner.query(`DROP TRIGGER ledger_entry_immutable ON "ledger_entry"`);
        await queryRunner.query(`DROP FUNCTION ledger_journal_must_balance()`);
        await queryRunner.query(`DROP FUNCTION ledger_entry_immutable()`);
        await queryRunner.query(`ALTER TABLE "ledger_entry" DROP CONSTRAINT "FK_f51c20726076921b4697f67a8c1"`);
        await queryRunner.query(`ALTER TABLE "ledger_entry" DROP CONSTRAINT "FK_081cfd83eb0c774575b864f0237"`);
        await queryRunner.query(`ALTER TABLE "ledger_account" DROP CONSTRAINT "FK_b1f65eb3d18dc7436ffc0731c66"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0b3bdfb6dca043b0ece2caae64"`);
        await queryRunner.query(`DROP TABLE "ledger_journal"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_journal_type_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a24ff8a49f06d921a4e6311254"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_081cfd83eb0c774575b864f023"`);
        await queryRunner.query(`DROP TABLE "ledger_entry"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_entry_currency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_entry_side_enum"`);
        await queryRunner.query(`DROP TABLE "ledger_account"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_account_currency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."ledger_account_type_enum"`);
    }

}
