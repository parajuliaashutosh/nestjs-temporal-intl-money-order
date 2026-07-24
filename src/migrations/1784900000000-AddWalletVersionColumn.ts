import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWalletVersionColumn1784900000000 implements MigrationInterface {
  name = 'AddWalletVersionColumn1784900000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallet"
      ADD COLUMN IF NOT EXISTS "version" integer NOT NULL DEFAULT 1
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "wallet"
      DROP COLUMN IF EXISTS "version"
    `);
  }
}
