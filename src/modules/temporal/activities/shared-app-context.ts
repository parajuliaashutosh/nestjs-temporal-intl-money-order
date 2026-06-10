import { AppModule } from '@/src/app.module';
import { INestApplicationContext } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';

let appContext: INestApplicationContext | null = null;

export async function getAppContext(): Promise<INestApplicationContext> {
  if (!appContext) {
    appContext = await NestFactory.createApplicationContext(AppModule);
  }
  return appContext;
}
