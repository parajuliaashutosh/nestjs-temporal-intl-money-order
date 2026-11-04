import { AppModule } from '@/src/app.module';
import { cookieMiddleware } from '@/src/common/middleware/cookie.middleware';
import { LoggerMiddleware } from '@/src/common/middleware/logger.middleware';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NodeAdapter, type NestNodeApplication } from '@nestjs/platform-node';
import { useSwagger } from './swagger.config';

export async function AppConfig() {
  const app = await NestFactory.create<NestNodeApplication>(
    AppModule,
    new NodeAdapter(),
    {
      rawBody: true, // Enable raw body for Stripe webhook signature verification
    },
  );
  const configService = app.get(ConfigService);

  const allowedOriginsStr = configService.getOrThrow<string>('ALLOWED_ORIGINS');
  const allowedOrigins = allowedOriginsStr
    ? allowedOriginsStr.split(',').map((origin) => origin.trim())
    : [];

  app.enableCors({
    origin: allowedOrigins.length ? allowedOrigins : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    credentials: true,
    allowedHeaders: [
      'Content-Type',
      'Authorization',
      'X-Requested-With',
      'x-country-code',
    ],
    exposedHeaders: ['X-Total-Count'],
    maxAge: 3600,
  });

  app.use(cookieMiddleware);
  app.use(new LoggerMiddleware().use.bind(new LoggerMiddleware()));
  app.setGlobalPrefix('api/v1');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Swagger Configuration
  useSwagger(app);

  return app;
}
