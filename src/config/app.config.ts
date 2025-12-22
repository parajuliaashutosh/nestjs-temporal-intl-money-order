import { AppModule } from '@/src/app.module';
import { NestFactory } from '@nestjs/core';

export async function AppConfig() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api/v1');
  return app;
}
