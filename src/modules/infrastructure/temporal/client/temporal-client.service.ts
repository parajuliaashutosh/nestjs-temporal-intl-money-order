import { AppException } from '@/src/common/exception/app.exception';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@temporalio/client';

@Injectable()
export class TemporalClientService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(TemporalClientService.name);

  async onModuleInit() {
    await this.connect();
  }

  private async connect() {
    try {
      this.client = new Client({
        // Optional: specify your Temporal server address, namespace, etc.
        // connection: { address: 'localhost:7233' }, 
        namespace: 'default',
      });

      this.logger.log('✅ Connected to Temporal');
    } catch (err) {
      this.logger.error('❌ Failed to connect to Temporal', err);
      throw err;
    }
  }

  async startWorkflow(workflowType: string, args: any[], taskQueue: string) {
    console.log("🚀 ~ TemporalClientService ~ startWorkflow ~ taskQueue:", taskQueue)
    console.log("🚀 ~ TemporalClientService ~ startWorkflow ~ args:", args)
    console.log("🚀 ~ TemporalClientService ~ startWorkflow ~ workflowType:", workflowType)
    if (!this.client) {
      throw AppException.internalServerError('Service maintenance in progress. Please try again later.');
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
