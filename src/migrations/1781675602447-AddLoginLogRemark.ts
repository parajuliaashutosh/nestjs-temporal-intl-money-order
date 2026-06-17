import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddLoginLogRemark1781675602447 implements MigrationInterface {
  name = 'AddLoginLogRemark1781675602447';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "login_log"
      ADD COLUMN IF NOT EXISTS "remark" varchar NULL
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      ALTER TABLE "login_log"
      DROP COLUMN IF EXISTS "remark"
    `);
  }
}
