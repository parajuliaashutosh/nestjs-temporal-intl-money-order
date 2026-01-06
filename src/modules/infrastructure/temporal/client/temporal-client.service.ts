import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Client } from '@temporalio/client';

@Injectable()
export class TemporalClientService implements OnModuleInit {
  private client: Client;
  private readonly logger = new Logger(TemporalClientService.name);

  onModuleInit() {
    this.connect();
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

  async startWorkflow(workflowType: string, args: any[], taskQueue: string) {
    if (!this.client) {
      throw new Error('Temporal client not initialized');
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
