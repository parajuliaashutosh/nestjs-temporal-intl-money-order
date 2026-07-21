import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreatePasswordHistory1784592043210 implements MigrationInterface {
  name = 'CreatePasswordHistory1784592043210';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "password_history" (
        "id"         uuid              NOT NULL DEFAULT uuid_generate_v4(),
        "created_at" TIMESTAMP         NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP         NOT NULL DEFAULT now(),
        "deleted_at" TIMESTAMP,
        "password"   character varying NOT NULL,
        "auth_id"    uuid,
        CONSTRAINT "PK_password_history" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "IDX_password_history_auth_id"
        ON "password_history" ("auth_id")
    `);

    await queryRunner.query(`
      ALTER TABLE "password_history"
        ADD CONSTRAINT "FK_password_history_auth"
          FOREIGN KEY ("auth_id") REFERENCES "auth"("id") ON DELETE CASCADE
    `);

    // Seed the history with the password every existing account is using now,
    // so the reuse check has something to compare against from day one.
    await queryRunner.query(`
      INSERT INTO "password_history" ("password", "auth_id", "created_at")
      SELECT "password", "id", "created_at"
      FROM "auth"
      WHERE "deleted_at" IS NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "password_history"`);
  }
}
