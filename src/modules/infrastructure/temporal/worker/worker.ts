import { AppModule } from '@/src/app.module';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { TemporalWorkerService } from './temporal-worker.service';

const logger = new Logger('TemporalWorker');

async function bootstrap() {
  try {
    logger.log('Starting Temporal Worker...');

    // Create NestJS application context (no HTTP server)
    const app = await NestFactory.createApplicationContext(AppModule, {
      logger: ['log', 'error', 'warn', 'debug'],
    });

    // Enable graceful shutdown
    app.enableShutdownHooks();

    // Get worker service
    const workerService = app.get(TemporalWorkerService);

    // Start worker
    await workerService.start();

    logger.log('Worker started successfully');

    // // Handle graceful shutdown
    // process.on('SIGINT', async () => {
    //   logger.log('SIGINT received, shutting down worker...');
    //   await workerService.stop();
    //   await app.close();
    //   process.exit(0);
    // });

    // process.on('SIGTERM', async () => {
    //   logger.log('SIGTERM received, shutting down worker...');
    //   await workerService.stop();
    //   await app.close();
    //   process.exit(0);
    // });
  } catch (error) {
    logger.error('Failed to start worker', error);
    process.exit(1);
  }
}

bootstrap().catch((err) => {
  logger.error('Unexpected error in bootstrap', err);
  process.exit(1);
});