import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMoneyOrderAnalytics1781080678053 implements MigrationInterface {
    name = 'CreateMoneyOrderAnalytics1781080678053'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "admin" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "first_name" character varying NOT NULL, "middle_name" character varying, "last_name" character varying NOT NULL, CONSTRAINT "PK_e032310bcef831fb83101899b10" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."device_config_platform_enum" AS ENUM('Android', 'iOS', 'Web')`);
        await queryRunner.query(`CREATE TABLE "device_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "fcm" text, "deviceId" text, "platform" "public"."device_config_platform_enum", "badge_count" integer NOT NULL DEFAULT '0', "auth_id" uuid, CONSTRAINT "PK_57cb6d1b1e0f26d33e2300cb7fd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "login_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "login_at" TIMESTAMP, "logout_at" TIMESTAMP, "ip" character varying, "device_id" character varying, "loc" character varying, "city" character varying, "region" character varying, "country" character varying, "org" character varying, "timezone" character varying, "os" character varying, "browser" character varying, "raw_user_agent" character varying NOT NULL, "auth_id" uuid, CONSTRAINT "PK_829ba3026b2886c163fb5c91607" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."auth_email_verification_status_enum" AS ENUM('VERIFIED', 'UNVERIFIED')`);
        await queryRunner.query(`CREATE TYPE "public"."auth_phone_verification_status_enum" AS ENUM('VERIFIED', 'UNVERIFIED')`);
        await queryRunner.query(`CREATE TYPE "public"."auth_role_enum" AS ENUM('USER', 'ADMIN', 'SUPER_ADMIN', 'SUDO_ADMIN')`);
        await queryRunner.query(`CREATE TABLE "auth" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "email" character varying NOT NULL, "phone_number" character varying, "email_verification_status" "public"."auth_email_verification_status_enum" NOT NULL DEFAULT 'UNVERIFIED', "phone_verification_status" "public"."auth_phone_verification_status_enum" NOT NULL DEFAULT 'UNVERIFIED', "role" "public"."auth_role_enum" NOT NULL DEFAULT 'USER', "password" character varying NOT NULL, "token_version" integer NOT NULL DEFAULT '0', "admin_id" uuid, CONSTRAINT "UQ_b54f616411ef3824f6a5c06ea46" UNIQUE ("email"), CONSTRAINT "UQ_013ebd35a4410a1b79111495f97" UNIQUE ("phone_number"), CONSTRAINT "REL_aa96af1497dfb79f48157654f7" UNIQUE ("admin_id"), CONSTRAINT "PK_7e416cf6172bc5aec04244f6459" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_013ebd35a4410a1b79111495f9" ON "auth" ("phone_number") `);
        await queryRunner.query(`CREATE TABLE "receiver" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "first_name" character varying NOT NULL, "middle_name" character varying, "last_name" character varying NOT NULL, "email" character varying, "phone_number" character varying, "address" character varying, "bank_name" character varying NOT NULL, "bank_account_number" character varying NOT NULL, "user_id" uuid, CONSTRAINT "PK_c49c8583f3bebce9c6a3403ed30" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."money-order_status_enum" AS ENUM('PENDING', 'PROCESSING', 'ON_HOLD', 'COMPLETED', 'FAILED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TYPE "public"."money-order_delivery_status_enum" AS ENUM('DELIVERY_NOT_AUTHORIZED', 'DELIVERY_AUTHORIZED', 'DELIVERY_INITIATED', 'DELIVERY_COMPLETED', 'DELIVERY_FAILED')`);
        await queryRunner.query(`CREATE TABLE "money-order" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "sending_amount" bigint NOT NULL DEFAULT '0', "receiver_amount" bigint NOT NULL DEFAULT '0', "exchange_rate" numeric(18,8) NOT NULL, "idempotent_id" character varying, "status" "public"."money-order_status_enum" NOT NULL DEFAULT 'PENDING', "delivery_status" "public"."money-order_delivery_status_enum" NOT NULL DEFAULT 'DELIVERY_NOT_AUTHORIZED', "metadata" jsonb, "user_id" uuid, "receiver_id" uuid, CONSTRAINT "UQ_c41dbcc180d592f03a606747f3f" UNIQUE ("idempotent_id"), CONSTRAINT "PK_92ccbdf90e0942fadae46b3335e" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."user_kyc_status_enum" AS ENUM('PENDING', 'VERIFIED', 'REJECTED')`);
        await queryRunner.query(`CREATE TYPE "public"."user_country_code_enum" AS ENUM('USA', 'AUS')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "firstName" character varying NOT NULL, "middleName" character varying, "lastName" character varying NOT NULL, "kyc_status" "public"."user_kyc_status_enum" NOT NULL DEFAULT 'PENDING', "country_code" "public"."user_country_code_enum", "user_token_version" integer NOT NULL DEFAULT '0', "invalidated_token_version" integer NOT NULL DEFAULT '-1', "wallet_id" uuid, "auth_id" uuid, CONSTRAINT "REL_b453ec3d9d579f6b9699be98be" UNIQUE ("wallet_id"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_0dc8e8008bed1a2f388ba3970c" ON "user" ("auth_id", "country_code") `);
        await queryRunner.query(`CREATE TYPE "public"."wallet_currency_enum" AS ENUM('USD', 'AUD')`);
        await queryRunner.query(`CREATE TABLE "wallet" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "balance" bigint NOT NULL DEFAULT '0', "currency" "public"."wallet_currency_enum" NOT NULL, CONSTRAINT "PK_bec464dd8d54c39c54fd32e2334" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transaction_direction_enum" AS ENUM('CREDIT', 'DEBIT')`);
        await queryRunner.query(`CREATE TYPE "public"."wallet_transaction_historytype_enum" AS ENUM('TOP_UP', 'WITHDRAWAL', 'ORDER_PAYMENT', 'ORDER_REFUND', 'BONUS', 'CASHBACK', 'SERVICE_FEE')`);
        await queryRunner.query(`CREATE TABLE "wallet_transaction" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "direction" "public"."wallet_transaction_direction_enum" NOT NULL, "historyType" "public"."wallet_transaction_historytype_enum" NOT NULL, "amount" numeric(18,2) NOT NULL, "balanceAfter" numeric(18,2) NOT NULL, "idempotentId" character varying, "walletId" uuid, CONSTRAINT "UQ_f59e4ebf9be541437c5eae7ea01" UNIQUE ("idempotentId"), CONSTRAINT "PK_62a01b9c3a734b96a08c621b371" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."system_config_country_code_enum" AS ENUM('USA', 'AUS')`);
        await queryRunner.query(`CREATE TYPE "public"."system_config_currency_enum" AS ENUM('USD', 'AUD')`);
        await queryRunner.query(`CREATE TABLE "system_config" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "country_code" "public"."system_config_country_code_enum" NOT NULL, "currency" "public"."system_config_currency_enum" NOT NULL, "exchange_rate" numeric(18,8) NOT NULL, CONSTRAINT "PK_db4e70ac0d27e588176e9bb44a0" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "payout" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "moneyOrderId" character varying NOT NULL, "request" jsonb NOT NULL, "response" jsonb, "errResponses" jsonb, "retry_count" integer NOT NULL DEFAULT '0', CONSTRAINT "UQ_c97fffc6c72bec06175ef82aade" UNIQUE ("moneyOrderId"), CONSTRAINT "PK_1cb73ce021dc6618a3818b0a474" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "activity_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "entity" character varying NOT NULL, "entityId" character varying NOT NULL, "action" character varying NOT NULL, "authId" character varying, "payload" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_067d761e2956b77b14e534fd6f1" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."stripe_webhook_upstream_status_enum" AS ENUM('SUCCESS', 'FAILED', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "stripe_webhook_upstream" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "stripeId" character varying, "userId" character varying, "amount" bigint, "currency" character varying, "errorMessage" text, "errorCode" character varying, "errorType" character varying, "metadata" jsonb, "eventType" character varying NOT NULL, "payload" jsonb NOT NULL, "webhookSignature" character varying, "ipAddress" character varying, "status" "public"."stripe_webhook_upstream_status_enum" NOT NULL, CONSTRAINT "PK_fab02b6ec6e8887599eaa7fa33b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_1b8c6953231c34dda7b484dcc6" ON "stripe_webhook_upstream" ("stripeId") `);
        await queryRunner.query(`CREATE TYPE "public"."stripe_user_upstream_operationtype_enum" AS ENUM('PAYMENT_INTENT_CREATE', 'PAYMENT_INTENT_RETRIEVE', 'PAYMENT_INTENT_CANCEL', 'REFUND_CREATE', 'WEBHOOK_PAYMENT_INTENT_SUCCEEDED', 'WEBHOOK_PAYMENT_INTENT_FAILED', 'WEBHOOK_PAYMENT_INTENT_CANCELED', 'WEBHOOK_CHARGE_SUCCEEDED', 'WEBHOOK_CHARGE_FAILED', 'WEBHOOK_REFUND_CREATED', 'WEBHOOK_UNKNOWN')`);
        await queryRunner.query(`CREATE TYPE "public"."stripe_user_upstream_status_enum" AS ENUM('SUCCESS', 'FAILED', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "stripe_user_upstream" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "stripeId" character varying, "userId" character varying, "amount" bigint, "currency" character varying, "errorMessage" text, "errorCode" character varying, "errorType" character varying, "metadata" jsonb, "operationType" "public"."stripe_user_upstream_operationtype_enum" NOT NULL, "status" "public"."stripe_user_upstream_status_enum" NOT NULL, "request_payload" jsonb, CONSTRAINT "PK_8238772384f11cf758beca652b7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_08f16d3843fa107eef3d837302" ON "stripe_user_upstream" ("userId") `);
        await queryRunner.query(`CREATE TYPE "public"."stripe_downstream_log_operationtype_enum" AS ENUM('PAYMENT_INTENT_CREATE', 'PAYMENT_INTENT_RETRIEVE', 'PAYMENT_INTENT_CANCEL', 'REFUND_CREATE', 'WEBHOOK_PAYMENT_INTENT_SUCCEEDED', 'WEBHOOK_PAYMENT_INTENT_FAILED', 'WEBHOOK_PAYMENT_INTENT_CANCELED', 'WEBHOOK_CHARGE_SUCCEEDED', 'WEBHOOK_CHARGE_FAILED', 'WEBHOOK_REFUND_CREATED', 'WEBHOOK_UNKNOWN')`);
        await queryRunner.query(`CREATE TYPE "public"."stripe_downstream_log_status_enum" AS ENUM('SUCCESS', 'FAILED', 'PENDING')`);
        await queryRunner.query(`CREATE TABLE "stripe_downstream_log" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, "stripeId" character varying, "userId" character varying, "amount" bigint, "currency" character varying, "errorMessage" text, "errorCode" character varying, "errorType" character varying, "metadata" jsonb, "idempotency_key" character varying NOT NULL, "operationType" "public"."stripe_downstream_log_operationtype_enum" NOT NULL, "status" "public"."stripe_downstream_log_status_enum" NOT NULL, "request_payload" jsonb, "response_payload" jsonb, "http_status_code" integer, "processing_time_ms" integer, CONSTRAINT "PK_c298a417c07f48daed6df68927b" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE UNIQUE INDEX "IDX_77862173e8f54ea9be71cb79fc" ON "stripe_downstream_log" ("idempotency_key") `);
        await queryRunner.query(`ALTER TABLE "device_config" ADD CONSTRAINT "FK_2cb85976e7649c56ffb3161eb5a" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "login_log" ADD CONSTRAINT "FK_f6bfb109503d6db8126055e5051" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "auth" ADD CONSTRAINT "FK_aa96af1497dfb79f48157654f7a" FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "receiver" ADD CONSTRAINT "FK_adcf634c25c446e6d07ad1e0a72" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "money-order" ADD CONSTRAINT "FK_cdd80539fa1e9b0f52d66302b99" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "money-order" ADD CONSTRAINT "FK_b1ecbb0883d948a1d7cba16507e" FOREIGN KEY ("receiver_id") REFERENCES "receiver"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb" FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user" ADD CONSTRAINT "FK_56d00ec31dc3eed1c3f6bff4f58" FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" ADD CONSTRAINT "FK_07de5136ba8e92bb97d45b9a7af" FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`CREATE MATERIALIZED VIEW "money_order_analytics" AS 
    SELECT
      (mo.created_at AT TIME ZONE 'UTC')::date AS day,
      u.country_code                            AS country,
      mo.status                                 AS status,
      COUNT(*)::int                             AS order_count,
      COALESCE(SUM(mo.sending_amount), 0)::bigint  AS total_sending_amount,
      COALESCE(SUM(mo.receiver_amount), 0)::bigint AS total_receiver_amount
    FROM "money-order" mo
    LEFT JOIN "user" u ON u.id = mo.user_id
    WHERE mo.deleted_at IS NULL
    GROUP BY 1, 2, 3
  `);
        await queryRunner.query(`INSERT INTO "typeorm_metadata"("database", "schema", "table", "type", "name", "value") VALUES (DEFAULT, $1, DEFAULT, $2, $3, $4)`, ["public","MATERIALIZED_VIEW","money_order_analytics","SELECT\n      (mo.created_at AT TIME ZONE 'UTC')::date AS day,\n      u.country_code                            AS country,\n      mo.status                                 AS status,\n      COUNT(*)::int                             AS order_count,\n      COALESCE(SUM(mo.sending_amount), 0)::bigint  AS total_sending_amount,\n      COALESCE(SUM(mo.receiver_amount), 0)::bigint AS total_receiver_amount\n    FROM \"money-order\" mo\n    LEFT JOIN \"user\" u ON u.id = mo.user_id\n    WHERE mo.deleted_at IS NULL\n    GROUP BY 1, 2, 3"]);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE FROM "typeorm_metadata" WHERE "type" = $1 AND "name" = $2 AND "schema" = $3`, ["MATERIALIZED_VIEW","money_order_analytics","public"]);
        await queryRunner.query(`DROP MATERIALIZED VIEW "money_order_analytics"`);
        await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_07de5136ba8e92bb97d45b9a7af"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_56d00ec31dc3eed1c3f6bff4f58"`);
        await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_b453ec3d9d579f6b9699be98beb"`);
        await queryRunner.query(`ALTER TABLE "money-order" DROP CONSTRAINT "FK_b1ecbb0883d948a1d7cba16507e"`);
        await queryRunner.query(`ALTER TABLE "money-order" DROP CONSTRAINT "FK_cdd80539fa1e9b0f52d66302b99"`);
        await queryRunner.query(`ALTER TABLE "receiver" DROP CONSTRAINT "FK_adcf634c25c446e6d07ad1e0a72"`);
        await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "FK_aa96af1497dfb79f48157654f7a"`);
        await queryRunner.query(`ALTER TABLE "login_log" DROP CONSTRAINT "FK_f6bfb109503d6db8126055e5051"`);
        await queryRunner.query(`ALTER TABLE "device_config" DROP CONSTRAINT "FK_2cb85976e7649c56ffb3161eb5a"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_77862173e8f54ea9be71cb79fc"`);
        await queryRunner.query(`DROP TABLE "stripe_downstream_log"`);
        await queryRunner.query(`DROP TYPE "public"."stripe_downstream_log_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stripe_downstream_log_operationtype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_08f16d3843fa107eef3d837302"`);
        await queryRunner.query(`DROP TABLE "stripe_user_upstream"`);
        await queryRunner.query(`DROP TYPE "public"."stripe_user_upstream_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."stripe_user_upstream_operationtype_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_1b8c6953231c34dda7b484dcc6"`);
        await queryRunner.query(`DROP TABLE "stripe_webhook_upstream"`);
        await queryRunner.query(`DROP TYPE "public"."stripe_webhook_upstream_status_enum"`);
        await queryRunner.query(`DROP TABLE "activity_log"`);
        await queryRunner.query(`DROP TABLE "payout"`);
        await queryRunner.query(`DROP TABLE "system_config"`);
        await queryRunner.query(`DROP TYPE "public"."system_config_currency_enum"`);
        await queryRunner.query(`DROP TYPE "public"."system_config_country_code_enum"`);
        await queryRunner.query(`DROP TABLE "wallet_transaction"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transaction_historytype_enum"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_transaction_direction_enum"`);
        await queryRunner.query(`DROP TABLE "wallet"`);
        await queryRunner.query(`DROP TYPE "public"."wallet_currency_enum"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_0dc8e8008bed1a2f388ba3970c"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_country_code_enum"`);
        await queryRunner.query(`DROP TYPE "public"."user_kyc_status_enum"`);
        await queryRunner.query(`DROP TABLE "money-order"`);
        await queryRunner.query(`DROP TYPE "public"."money-order_delivery_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."money-order_status_enum"`);
        await queryRunner.query(`DROP TABLE "receiver"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_013ebd35a4410a1b79111495f9"`);
        await queryRunner.query(`DROP TABLE "auth"`);
        await queryRunner.query(`DROP TYPE "public"."auth_role_enum"`);
        await queryRunner.query(`DROP TYPE "public"."auth_phone_verification_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."auth_email_verification_status_enum"`);
        await queryRunner.query(`DROP TABLE "login_log"`);
        await queryRunner.query(`DROP TABLE "device_config"`);
        await queryRunner.query(`DROP TYPE "public"."device_config_platform_enum"`);
        await queryRunner.query(`DROP TABLE "admin"`);
    }

}
