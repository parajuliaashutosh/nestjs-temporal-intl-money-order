import { AppException } from '@/src/common/exception/app.exception';
import { UTIL_FUNCTIONS } from '@/src/common/util/common-functions';
import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Client } from '@temporalio/client';
import { WorkflowValue } from '../workflow.constant';

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

  async startWorkflow(WorkflowValue: WorkflowValue, args: any[], taskQueue: string) {
    console.log(
      '🚀 ~ TemporalClientService ~ startWorkflow ~ taskQueue:',
      taskQueue,
    );
    console.log('🚀 ~ TemporalClientService ~ startWorkflow ~ args:', args);
    console.log(
      '🚀 ~ TemporalClientService ~ startWorkflow ~ workflowKey:',
      WorkflowValue,
    );
    if (!this.client) {
      throw AppException.internalServerError(
        'Service maintenance in progress. Please try again later.',
      );
    }
    const workflowId = `${UTIL_FUNCTIONS.toKebabCase(WorkflowValue)}-${args?.[0]}-${Date.now()}`;

    const handle = await this.client.workflow.start(WorkflowValue, {
      args,
      taskQueue,
      workflowId,
    });

    this.logger.log(`🚀 Workflow started: ${handle.workflowId}`);
    return handle;
  }
}
