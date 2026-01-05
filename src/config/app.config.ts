import { AppModule } from '@/src/app.module';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

export async function AppConfig() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');
  return app;
}
