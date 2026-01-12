import { AppException } from '@/src/common/exception/app.exception';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from '@temporalio/client';

@Injectable()
export class TemporalClientService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(TemporalClientService.name);

  onModuleInit() {
    this.connect();
  }

  async onModuleDestroy() {
    await this.stopWorker();
  }

  private connect() {
    try {
      this.client = new Client({
        // Optional: specify your Temporal server address, namespace, etc.
        // connection: { address: 'localhost:7233' },
        namespace: 'money-order',
      });

      this.logger.log('✅ Connected to Temporal');
    } catch (err) {
      this.logger.error('❌ Failed to connect to Temporal', err);
      throw err;
    }
  }

  private async stopWorker() {
    if (this.client) {
      await this.client.options.connection.close();
      this.logger.log('Temporal worker stopped');
    }
  }

  async startWorkflow(workflowType: string, args: any[], taskQueue: string) {
    console.log(
      '🚀 ~ TemporalClientService ~ startWorkflow ~ taskQueue:',
      taskQueue,
    );
    console.log('🚀 ~ TemporalClientService ~ startWorkflow ~ args:', args);
    console.log(
      '🚀 ~ TemporalClientService ~ startWorkflow ~ workflowType:',
      workflowType,
    );
    if (!this.client) {
      throw AppException.internalServerError(
        'Service maintenance in progress. Please try again later.',
      );
    }

    const handle = await this.client.workflow.start(workflowType, {
      args,
      taskQueue,
      workflowId: `${workflowType}-${Date.now()}`,
    });

    this.logger.log(`🚀 Workflow started: ${handle.workflowId}`);
    return handle;
  }
}
