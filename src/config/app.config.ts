import { AppModule } from '@/src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import cookieParser from 'cookie-parser';

export async function AppConfig() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  const allowedOriginsStr = configService.getOrThrow<string>('ALLOWED_ORIGINS');
  const allowedOrigins = allowedOriginsStr
    ? allowedOriginsStr.split(',').map((origin) => origin.trim())
    : [];

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-country-code'],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 3600,
  });

  app.use(cookieParser());
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  return app;
}
