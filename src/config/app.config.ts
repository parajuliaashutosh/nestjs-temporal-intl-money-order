import { NestFactory } from '@nestjs/core';
import { WinstonModule } from 'nest-winston';
import { AppModule } from 'src/app.module';
import { winstonLoggerOptions } from 'src/logger/winston.logger';

export async function AppConfig() {
  const app = await NestFactory.create(AppModule, {
    logger: WinstonModule.createLogger(winstonLoggerOptions),
  });

  app.setGlobalPrefix('api/v1');
  return app;
}
