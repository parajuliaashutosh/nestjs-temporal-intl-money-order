import { AppConfig } from './config/app.config';

async function bootstrap() {
  const app = await AppConfig();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  console.error('Error during application bootstrap:', err);
  process.exit(1);
});
