import { TypeOrmDataSource as AppDataSource } from './config/typeorm.datasource';

async function run() {
  await AppDataSource.initialize();
  const ran = await AppDataSource.runMigrations();
  console.log(`Migrations run: ${ran.length}`);
  await AppDataSource.destroy();
  process.exit(0);
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
