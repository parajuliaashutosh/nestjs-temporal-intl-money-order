import { Logger } from '@nestjs/common';
import { AppConfig } from './config/app.config';

process.on('uncaughtException', (err) => {
  Logger.error('UNCAUGHT EXCEPTION:', err);
});

process.on('unhandledRejection', (reason) => {
  Logger.error('UNHANDLED REJECTION:', reason);
});

async function bootstrap() {
  const app = await AppConfig();
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap().catch((err) => {
  Logger.error('Error during application bootstrap:', err);
  process.exit(1);
});
