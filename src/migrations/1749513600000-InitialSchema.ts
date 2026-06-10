import { MigrationInterface, QueryRunner } from 'typeorm';

// ⚠️  DO NOT run this migration against an existing database that was managed
//    by synchronize: true.  The schema already exists.  Instead, mark this
//    migration as executed by running the INSERT below directly on the DB:
//
//  INSERT INTO "_migrations" (timestamp, name)
//  VALUES (1749513600000, 'InitialSchema1749513600000');

export class InitialSchema1749513600000 implements MigrationInterface {
  name = 'InitialSchema1749513600000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ── Enum types ────────────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE TYPE "auth_email_verification_status_enum"
        AS ENUM ('VERIFIED', 'UNVERIFIED')
    `);
    await queryRunner.query(`
      CREATE TYPE "auth_phone_verification_status_enum"
        AS ENUM ('VERIFIED', 'UNVERIFIED')
    `);
    await queryRunner.query(`
      CREATE TYPE "auth_role_enum"
        AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN', 'SUDO_ADMIN')
    `);
    await queryRunner.query(`
      CREATE TYPE "user_kyc_status_enum"
        AS ENUM ('PENDING', 'VERIFIED', 'REJECTED')
    `);
    await queryRunner.query(`
      CREATE TYPE "user_country_code_enum"
        AS ENUM ('USA', 'AUS')
    `);
    await queryRunner.query(`
      CREATE TYPE "wallet_currency_enum"
        AS ENUM ('USD', 'AUD')
    `);
    await queryRunner.query(`
      CREATE TYPE "wallet_transaction_direction_enum"
        AS ENUM ('CREDIT', 'DEBIT')
    `);
    await queryRunner.query(`
      CREATE TYPE "wallet_transaction_historyType_enum"
        AS ENUM ('TOP_UP', 'WITHDRAWAL', 'ORDER_PAYMENT', 'ORDER_REFUND',
                 'BONUS', 'CASHBACK', 'SERVICE_FEE')
    `);
    await queryRunner.query(`
      CREATE TYPE "money-order_status_enum"
        AS ENUM ('PENDING', 'PROCESSING', 'ON_HOLD', 'COMPLETED', 'FAILED', 'CANCELLED')
    `);
    await queryRunner.query(`
      CREATE TYPE "money-order_delivery_status_enum"
        AS ENUM ('DELIVERY_NOT_AUTHORIZED', 'DELIVERY_AUTHORIZED',
                 'DELIVERY_INITIATED', 'DELIVERY_COMPLETED', 'DELIVERY_FAILED')
    `);
    await queryRunner.query(`
      CREATE TYPE "system_config_country_code_enum"
        AS ENUM ('USA', 'AUS')
    `);
    await queryRunner.query(`
      CREATE TYPE "system_config_currency_enum"
        AS ENUM ('USD', 'AUD')
    `);
    await queryRunner.query(`
      CREATE TYPE "device_config_platform_enum"
        AS ENUM ('Android', 'iOS', 'Web')
    `);
    await queryRunner.query(`
      CREATE TYPE "stripe_downstream_log_operationType_enum"
        AS ENUM ('PAYMENT_INTENT_CREATE', 'PAYMENT_INTENT_RETRIEVE',
                 'PAYMENT_INTENT_CANCEL', 'REFUND_CREATE',
                 'WEBHOOK_PAYMENT_INTENT_SUCCEEDED', 'WEBHOOK_PAYMENT_INTENT_FAILED',
                 'WEBHOOK_PAYMENT_INTENT_CANCELED', 'WEBHOOK_CHARGE_SUCCEEDED',
                 'WEBHOOK_CHARGE_FAILED', 'WEBHOOK_REFUND_CREATED', 'WEBHOOK_UNKNOWN')
    `);
    await queryRunner.query(`
      CREATE TYPE "stripe_downstream_log_status_enum"
        AS ENUM ('SUCCESS', 'FAILED', 'PENDING')
    `);
    await queryRunner.query(`
      CREATE TYPE "stripe_user_upstream_operationType_enum"
        AS ENUM ('PAYMENT_INTENT_CREATE', 'PAYMENT_INTENT_RETRIEVE',
                 'PAYMENT_INTENT_CANCEL', 'REFUND_CREATE',
                 'WEBHOOK_PAYMENT_INTENT_SUCCEEDED', 'WEBHOOK_PAYMENT_INTENT_FAILED',
                 'WEBHOOK_PAYMENT_INTENT_CANCELED', 'WEBHOOK_CHARGE_SUCCEEDED',
                 'WEBHOOK_CHARGE_FAILED', 'WEBHOOK_REFUND_CREATED', 'WEBHOOK_UNKNOWN')
    `);
    await queryRunner.query(`
      CREATE TYPE "stripe_user_upstream_status_enum"
        AS ENUM ('SUCCESS', 'FAILED', 'PENDING')
    `);
    await queryRunner.query(`
      CREATE TYPE "stripe_webhook_upstream_status_enum"
        AS ENUM ('SUCCESS', 'FAILED', 'PENDING')
    `);

    // ── Tables (leaf-first to satisfy FK constraints) ─────────────────────────

    await queryRunner.query(`
      CREATE TABLE "admin" (
        "id"          uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"  TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP         NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMP,
        "first_name"  character varying NOT NULL,
        "middle_name" character varying,
        "last_name"   character varying NOT NULL,
        CONSTRAINT "PK_admin" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "auth" (
        "id"                          uuid                                        NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"                  TIMESTAMP                                   NOT NULL DEFAULT now(),
        "updated_at"                  TIMESTAMP                                   NOT NULL DEFAULT now(),
        "deleted_at"                  TIMESTAMP,
        "email"                       character varying                           NOT NULL,
        "phone_number"                character varying                           UNIQUE,
        "email_verification_status"   "auth_email_verification_status_enum"       NOT NULL DEFAULT 'UNVERIFIED',
        "phone_verification_status"   "auth_phone_verification_status_enum"       NOT NULL DEFAULT 'UNVERIFIED',
        "role"                        "auth_role_enum"                            NOT NULL DEFAULT 'USER',
        "password"                    character varying                           NOT NULL,
        "token_version"               integer                                     NOT NULL DEFAULT 0,
        "admin_id"                    uuid,
        CONSTRAINT "UQ_auth_email"    UNIQUE ("email"),
        CONSTRAINT "PK_auth"          PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`CREATE INDEX "IDX_auth_phone_number" ON "auth" ("phone_number")`);

    await queryRunner.query(`
      CREATE TABLE "wallet" (
        "id"         uuid                     NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP                NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP                NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "balance"    bigint                   NOT NULL DEFAULT '0',
        "currency"   "wallet_currency_enum"   NOT NULL,
        CONSTRAINT "PK_wallet" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "user" (
        "id"                        uuid                     NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"                TIMESTAMP                NOT NULL DEFAULT now(),
        "updated_at"                TIMESTAMP                NOT NULL DEFAULT now(),
        "deleted_at"                TIMESTAMP,
        "firstName"                 character varying        NOT NULL,
        "middleName"                character varying,
        "lastName"                  character varying        NOT NULL,
        "kyc_status"                "user_kyc_status_enum"   NOT NULL DEFAULT 'PENDING',
        "country_code"              "user_country_code_enum",
        "user_token_version"        integer                  NOT NULL DEFAULT 0,
        "invalidated_token_version" integer                  NOT NULL DEFAULT -1,
        "wallet_id"                 uuid,
        "auth_id"                   uuid,
        CONSTRAINT "PK_user" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_user_auth_country" ON "user" ("auth_id", "country_code")
    `);

    await queryRunner.query(`
      CREATE TABLE "receiver" (
        "id"                  uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"          TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_at"          TIMESTAMP         NOT NULL DEFAULT now(),
        "deleted_at"          TIMESTAMP,
        "first_name"          character varying NOT NULL,
        "middle_name"         character varying,
        "last_name"           character varying NOT NULL,
        "email"               character varying,
        "phone_number"        character varying,
        "address"             character varying,
        "bank_name"           character varying NOT NULL,
        "bank_account_number" character varying NOT NULL,
        "user_id"             uuid,
        CONSTRAINT "PK_receiver" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "money-order" (
        "id"              uuid                                NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"      TIMESTAMP                           NOT NULL DEFAULT now(),
        "updated_at"      TIMESTAMP                           NOT NULL DEFAULT now(),
        "deleted_at"      TIMESTAMP,
        "sending_amount"  bigint                              NOT NULL DEFAULT '0',
        "receiver_amount" bigint                              NOT NULL DEFAULT '0',
        "exchange_rate"   numeric(18,8)                       NOT NULL,
        "idempotent_id"   character varying                   UNIQUE,
        "status"          "money-order_status_enum"           NOT NULL DEFAULT 'PENDING',
        "delivery_status" "money-order_delivery_status_enum"  NOT NULL DEFAULT 'DELIVERY_NOT_AUTHORIZED',
        "metadata"        jsonb,
        "user_id"         uuid,
        "receiver_id"     uuid,
        CONSTRAINT "PK_money_order" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "payout" (
        "id"           uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"   TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_at"   TIMESTAMP         NOT NULL DEFAULT now(),
        "deleted_at"   TIMESTAMP,
        "moneyOrderId" character varying NOT NULL UNIQUE,
        "request"      jsonb             NOT NULL,
        "response"     jsonb,
        "errResponses" jsonb,
        "retry_count"  integer           NOT NULL DEFAULT 0,
        CONSTRAINT "PK_payout" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "wallet_transaction" (
        "id"            uuid                                    NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    TIMESTAMP                               NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP                               NOT NULL DEFAULT now(),
        "deleted_at"    TIMESTAMP,
        "direction"     "wallet_transaction_direction_enum"     NOT NULL,
        "historyType"   "wallet_transaction_historyType_enum"   NOT NULL,
        "amount"        numeric(18,2)                           NOT NULL,
        "balanceAfter"  numeric(18,2)                           NOT NULL,
        "idempotentId"  character varying                       UNIQUE,
        "walletId"      uuid,
        CONSTRAINT "PK_wallet_transaction" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "login_log" (
        "id"             uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"     TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_at"     TIMESTAMP         NOT NULL DEFAULT now(),
        "deleted_at"     TIMESTAMP,
        "login_at"       TIMESTAMP,
        "logout_at"      TIMESTAMP,
        "ip"             character varying,
        "device_id"      character varying,
        "loc"            character varying,
        "city"           character varying,
        "region"         character varying,
        "country"        character varying,
        "org"            character varying,
        "timezone"       character varying,
        "os"             character varying,
        "browser"        character varying,
        "raw_user_agent" character varying NOT NULL,
        "auth_id"        uuid,
        CONSTRAINT "PK_login_log" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "device_config" (
        "id"          uuid                         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"  TIMESTAMP                    NOT NULL DEFAULT now(),
        "updated_at"  TIMESTAMP                    NOT NULL DEFAULT now(),
        "deleted_at"  TIMESTAMP,
        "fcm"         text,
        "deviceId"    text,
        "platform"    "device_config_platform_enum",
        "badge_count" integer                      NOT NULL DEFAULT 0,
        "auth_id"     uuid,
        CONSTRAINT "PK_device_config" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "system_config" (
        "id"            uuid                              NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"    TIMESTAMP                         NOT NULL DEFAULT now(),
        "updated_at"    TIMESTAMP                         NOT NULL DEFAULT now(),
        "deleted_at"    TIMESTAMP,
        "country_code"  "system_config_country_code_enum" NOT NULL,
        "currency"      "system_config_currency_enum"     NOT NULL,
        "exchange_rate" numeric(18,8)                     NOT NULL,
        CONSTRAINT "PK_system_config" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "activity_log" (
        "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "entity"     character varying NOT NULL,
        "entityId"   character varying NOT NULL,
        "action"     character varying NOT NULL,
        "authId"     character varying,
        "payload"    jsonb,
        "created_at" TIMESTAMP         NOT NULL DEFAULT now(),
        CONSTRAINT "PK_activity_log" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "stripe_downstream_log" (
        "id"                  uuid                                          NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"          TIMESTAMP                                     NOT NULL DEFAULT now(),
        "updated_at"          TIMESTAMP                                     NOT NULL DEFAULT now(),
        "deleted_at"          TIMESTAMP,
        "stripeId"            character varying,
        "userId"              character varying,
        "amount"              bigint,
        "currency"            character varying,
        "errorMessage"        text,
        "errorCode"           character varying,
        "errorType"           character varying,
        "metadata"            jsonb,
        "idempotency_key"     character varying                             NOT NULL,
        "operationType"       "stripe_downstream_log_operationType_enum"   NOT NULL,
        "status"              "stripe_downstream_log_status_enum"           NOT NULL,
        "request_payload"     jsonb,
        "response_payload"    jsonb,
        "http_status_code"    integer,
        "processing_time_ms"  integer,
        CONSTRAINT "PK_stripe_downstream_log" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_stripe_downstream_log_idempotency_key"
        ON "stripe_downstream_log" ("idempotency_key")
    `);

    await queryRunner.query(`
      CREATE TABLE "stripe_user_upstream" (
        "id"               uuid                                         NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"       TIMESTAMP                                    NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP                                    NOT NULL DEFAULT now(),
        "deleted_at"       TIMESTAMP,
        "stripeId"         character varying,
        "userId"           character varying,
        "amount"           bigint,
        "currency"         character varying,
        "errorMessage"     text,
        "errorCode"        character varying,
        "errorType"        character varying,
        "metadata"         jsonb,
        "operationType"    "stripe_user_upstream_operationType_enum"    NOT NULL,
        "status"           "stripe_user_upstream_status_enum"           NOT NULL,
        "request_payload"  jsonb,
        CONSTRAINT "PK_stripe_user_upstream" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE INDEX "IDX_stripe_user_upstream_userId" ON "stripe_user_upstream" ("userId")
    `);

    await queryRunner.query(`
      CREATE TABLE "stripe_webhook_upstream" (
        "id"               uuid                                      NOT NULL DEFAULT uuid_generate_v4(),
        "created_at"       TIMESTAMP                                 NOT NULL DEFAULT now(),
        "updated_at"       TIMESTAMP                                 NOT NULL DEFAULT now(),
        "deleted_at"       TIMESTAMP,
        "stripeId"         character varying,
        "userId"           character varying,
        "amount"           bigint,
        "currency"         character varying,
        "errorMessage"     text,
        "errorCode"        character varying,
        "errorType"        character varying,
        "metadata"         jsonb,
        "eventType"        character varying                         NOT NULL,
        "payload"          jsonb                                     NOT NULL,
        "webhookSignature" character varying,
        "ipAddress"        character varying,
        "status"           "stripe_webhook_upstream_status_enum"     NOT NULL,
        CONSTRAINT "PK_stripe_webhook_upstream" PRIMARY KEY ("id")
      )
    `);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_stripe_webhook_upstream_stripeId"
        ON "stripe_webhook_upstream" ("stripeId")
    `);

    // ── Foreign keys ──────────────────────────────────────────────────────────

    await queryRunner.query(`
      ALTER TABLE "auth"
        ADD CONSTRAINT "FK_auth_admin"
          FOREIGN KEY ("admin_id") REFERENCES "admin"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD CONSTRAINT "FK_user_wallet"
          FOREIGN KEY ("wallet_id") REFERENCES "wallet"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "user"
        ADD CONSTRAINT "FK_user_auth"
          FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "receiver"
        ADD CONSTRAINT "FK_receiver_user"
          FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "money-order"
        ADD CONSTRAINT "FK_money_order_user"
          FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "money-order"
        ADD CONSTRAINT "FK_money_order_receiver"
          FOREIGN KEY ("receiver_id") REFERENCES "receiver"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "wallet_transaction"
        ADD CONSTRAINT "FK_wallet_transaction_wallet"
          FOREIGN KEY ("walletId") REFERENCES "wallet"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "login_log"
        ADD CONSTRAINT "FK_login_log_auth"
          FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE
    `);
    await queryRunner.query(`
      ALTER TABLE "device_config"
        ADD CONSTRAINT "FK_device_config_auth"
          FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE
    `);

    // ── Materialized view ─────────────────────────────────────────────────────

    await queryRunner.query(`
      CREATE MATERIALIZED VIEW "money_order_analytics" AS
        SELECT
          (mo.created_at AT TIME ZONE 'UTC')::date       AS day,
          u.country_code                                  AS country,
          mo.status                                       AS status,
          COUNT(*)::int                                   AS order_count,
          COALESCE(SUM(mo.sending_amount), 0)::bigint     AS total_sending_amount,
          COALESCE(SUM(mo.receiver_amount), 0)::bigint    AS total_receiver_amount
        FROM "money-order" mo
        LEFT JOIN "user" u ON u.id = mo.user_id
        WHERE mo.deleted_at IS NULL
        GROUP BY 1, 2, 3
      WITH NO DATA
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP MATERIALIZED VIEW IF EXISTS "money_order_analytics"`);

    await queryRunner.query(`ALTER TABLE "device_config" DROP CONSTRAINT "FK_device_config_auth"`);
    await queryRunner.query(`ALTER TABLE "login_log" DROP CONSTRAINT "FK_login_log_auth"`);
    await queryRunner.query(`ALTER TABLE "wallet_transaction" DROP CONSTRAINT "FK_wallet_transaction_wallet"`);
    await queryRunner.query(`ALTER TABLE "money-order" DROP CONSTRAINT "FK_money_order_receiver"`);
    await queryRunner.query(`ALTER TABLE "money-order" DROP CONSTRAINT "FK_money_order_user"`);
    await queryRunner.query(`ALTER TABLE "receiver" DROP CONSTRAINT "FK_receiver_user"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_auth"`);
    await queryRunner.query(`ALTER TABLE "user" DROP CONSTRAINT "FK_user_wallet"`);
    await queryRunner.query(`ALTER TABLE "auth" DROP CONSTRAINT "FK_auth_admin"`);

    await queryRunner.query(`DROP TABLE IF EXISTS "stripe_webhook_upstream"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stripe_user_upstream"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "stripe_downstream_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "activity_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "system_config"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "device_config"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "login_log"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet_transaction"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "payout"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "money-order"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "receiver"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "user"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallet"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "auth"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "admin"`);

    await queryRunner.query(`DROP TYPE IF EXISTS "stripe_webhook_upstream_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stripe_user_upstream_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stripe_user_upstream_operationType_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stripe_downstream_log_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stripe_downstream_log_operationType_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "device_config_platform_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "system_config_currency_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "system_config_country_code_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "money-order_delivery_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "money-order_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "wallet_transaction_historyType_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "wallet_transaction_direction_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "wallet_currency_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_country_code_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_kyc_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_phone_verification_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "auth_email_verification_status_enum"`);
  }
}
