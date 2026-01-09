import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NativeConnection, Worker } from '@temporalio/worker';
import { join } from 'path';
import * as activities from '../activities';

@Injectable()
export class TemporalWorkerService {
  private readonly logger = new Logger(TemporalWorkerService.name);
  private worker: Worker;

  constructor(private configService: ConfigService) {}

  async start() {
    try {
      const address = this.configService.get<string>('temporal.connection.address') || 'localhost:7233';
      const namespace = this.configService.get<string>('temporal.namespace') || 'money-order';
      const taskQueue = this.configService.get<string>('temporal.taskQueue') || 'money-order-queue';

      // Connect to Temporal server
      const connection: NativeConnection = await NativeConnection.connect({ address });

      // Create worker
      this.worker = await Worker.create({
        connection,
        namespace,
        taskQueue,
        workflowsPath: join(__dirname, '../workflows'),
        activities,
      });

      this.logger.log(`Worker starting on task queue: ${taskQueue}`);
      
      // Start worker
      await this.worker.run();
    } catch (error) {
      this.logger.error('Worker failed to start', error);
      throw error;
    }
  }

    stop() {
    if (this.worker) {
      this.logger.log('Stopping worker...');
      this.worker.shutdown();
    }
  }
}