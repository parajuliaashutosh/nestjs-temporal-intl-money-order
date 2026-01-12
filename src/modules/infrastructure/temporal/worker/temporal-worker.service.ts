import type { MoneyOrderFactoryContract } from '@/src/modules/money-order/contract/money-order-factory.contract';
import { MONEY_ORDER_FACTORY } from '@/src/modules/money-order/money-order.constant';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NativeConnection, Worker } from '@temporalio/worker';
import { join } from 'path';
import * as activities from '../activities';

@Injectable()
export class TemporalWorkerService {
  private readonly logger = new Logger(TemporalWorkerService.name);
  private worker: Worker;

  constructor(
    private configService: ConfigService,
    @Inject(MONEY_ORDER_FACTORY)
    private readonly moneyOrderActivities: MoneyOrderFactoryContract,
  ) {}

  async start() {
    try {
      const address = this.configService.getOrThrow<string>('TEMPORAL_ADDRESS');
      const namespace =  this.configService.getOrThrow<string>('TEMPORAL_NAMESPACE');
      const taskQueue =  this.configService.getOrThrow<string>('TEMPORAL_TASK_QUEUE');

      // Connect to Temporal server
      const connection: NativeConnection = await NativeConnection.connect({ address });

      // Create worker
      console.log("🚀 ~ TemporalWorkerService ~ start ~ activities:", join(__dirname, '../workflows'))
      this.worker = await Worker.create({
        connection,
        namespace,
        taskQueue,
        workflowsPath: join(__dirname, '../workflows'),
        activities: activities,
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