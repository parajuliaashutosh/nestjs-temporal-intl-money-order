import { AppException } from '@/src/common/exception/app.exception';
import { UTIL_FUNCTIONS } from '@/src/common/util/common-functions';
import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Connection } from '@temporalio/client';
import { WorkflowValue } from '../workflow.constant';

@Injectable()
export class TemporalClientService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private connection: Connection;

  private readonly logger = new Logger(TemporalClientService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.stopWorker();
  }

  private async connect() {
    try {
      this.connection = await Connection.connect({
        address: this.configService.getOrThrow<string>('TEMPORAL_ADDRESS'),
      });

      this.client = new Client({
        connection: this.connection,
        namespace: this.configService.getOrThrow<string>('TEMPORAL_NAMESPACE'),
      });

      this.logger.log('✅ Temporal client created successfully');
    } catch (err) {
      this.logger.error('❌ Failed to connect to Temporal', err);
      // throw err;
    }
  }

  private async stopWorker() {
    if (this.client) {
      await this.client.options.connection.close();
      this.logger.log('✅ Temporal client stopped');
    }
  }

  async startWorkflow(
    WorkflowValue: WorkflowValue,
    args: any[],
    taskQueue: string,
  ) {
    this.logger.log(
      '🚀 ~ TemporalClientService ~ startWorkflow ~ taskQueue:',
      taskQueue,
    );
    this.logger.log('🚀 ~ TemporalClientService ~ startWorkflow ~ args:', args);
    this.logger.log(
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
