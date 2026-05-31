import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function useSwagger(app: INestApplication) {
  const config = new DocumentBuilder()
    .setTitle('International Money Order API')
    .setDescription(
      'API documentation for the International Money Order system using NestJS and Temporal. Since I do not have frontend ready, I have made the documentation public.',
    )
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('registration', 'User and admin registration endpoints')
    .addTag('money-order', 'Money order management endpoints')
    .addTag('wallet', 'Wallet management endpoints')
    .addTag('receiver', 'Receiver management endpoints')
    .addTag('system-config', 'System configuration endpoints')
    .addTag('stripe', 'Stripe payment integration endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Enter JWT token',
        in: 'header',
      },
      'JWT-auth',
    )
    .addCookieAuth('accessToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'accessToken',
    })
    .addCookieAuth('refreshToken', {
      type: 'apiKey',
      in: 'cookie',
      name: 'refreshToken',
    })
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-country-code',
        in: 'header',
        description: 'Country code header (e.g., USA, AUS)',
      },
      'x-country-code',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });
}
