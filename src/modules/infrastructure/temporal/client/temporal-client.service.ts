import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client, Connection, WorkflowHandle } from '@temporalio/client';

@Injectable()
export class TemporalClientService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private connection: Connection;
  private readonly logger = new Logger(TemporalClientService.name);

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.disconnect();
  }

  /**
   * Establish connection to Temporal server
   */
  private async connect() {
    try {
      const address = this.configService.get<string>('temporal.connection.address');
      const namespace = this.configService.get<string>('temporal.namespace');

      this.connection = await Connection.connect({ address });
      
      this.client = new Client({
        connection: this.connection,
        namespace,
      });

      this.logger.log(`✅ Connected to Temporal at ${address}, namespace: ${namespace}`);
    } catch (error) {
      this.logger.error('❌ Failed to connect to Temporal', error.stack);
      throw error;
    }
  }

  /**
   * Close connection gracefully
   */
  private async disconnect() {
    try {
      if (this.connection) {
        await this.connection.close();
        this.logger.log('Temporal connection closed');
      }
    } catch (error) {
      this.logger.error('Error closing Temporal connection', error);
    }
  }

  /**
   * Get the Temporal client instance
   */
  getClient(): Client {
    if (!this.client) {
      throw new Error('Temporal client not initialized');
    }
    return this.client;
  }

  /**
   * Start a new workflow execution
   * 
   * @param workflowType - The workflow function name
   * @param args - Arguments to pass to the workflow
   * @param options - Workflow execution options
   * @returns Workflow handle with workflowId and runId
   */
  async startWorkflow<T = any>(
    workflowType: string,
    args: any[],
    options?: {
      workflowId?: string;
      taskQueue?: string;
      memo?: Record<string, any>;
      searchAttributes?: Record<string, any>;
    },
  ): Promise<WorkflowHandle<T>> {
    const taskQueue = options?.taskQueue || 
      this.configService.get<string>('temporal.taskQueue');

    const workflowId = options?.workflowId || `${workflowType}-${Date.now()}`;

    try {
      const handle = await this.client.workflow.start(workflowType, {
        args,
        taskQueue,
        workflowId,
        ...this.configService.get('temporal.workflowOptions'),
        memo: options?.memo,
        searchAttributes: options?.searchAttributes,
      });

      this.logger.log(`🚀 Started workflow: ${workflowId} (runId: ${handle.firstExecutionRunId})`);

      return handle;
    } catch (error) {
      this.logger.error(`Failed to start workflow: ${workflowType}`, error.stack);
      throw error;
    }
  }

  /**
   * Start workflow and wait for result
   * 
   * @param workflowType - The workflow function name
   * @param args - Arguments to pass to the workflow
   * @param options - Workflow execution options
   * @returns The workflow result
   */
  async executeWorkflow<T = any>(
    workflowType: string,
    args: any[],
    options?: {
      workflowId?: string;
      taskQueue?: string;
    },
  ): Promise<T> {
    const taskQueue = options?.taskQueue || 
      this.configService.get<string>('temporal.taskQueue');

    try {
      const result = await this.client.workflow.execute<T>(workflowType, {
        args,
        taskQueue,
        workflowId: options?.workflowId || `${workflowType}-${Date.now()}`,
        ...this.configService.get('temporal.workflowOptions'),
      });

      this.logger.log(`✅ Workflow completed: ${workflowType}`);
      return result;
    } catch (error) {
      this.logger.error(`Workflow execution failed: ${workflowType}`, error.stack);
      throw error;
    }
  }

  /**
   * Get a handle to an existing workflow
   * 
   * @param workflowId - The workflow ID
   * @param runId - Optional run ID for specific execution
   */
  async getWorkflowHandle<T = any>(
    workflowId: string, 
    runId?: string
  ): Promise<WorkflowHandle<T>> {
    return this.client.workflow.getHandle<T>(workflowId, runId);
  }

  /**
   * Query a running workflow
   * 
   * @param workflowId - The workflow ID
   * @param queryType - The query name defined in workflow
   * @param args - Arguments for the query
   * @returns Query result
   */
  async queryWorkflow<T = any>(
    workflowId: string, 
    queryType: string, 
    ...args: any[]
  ): Promise<T> {
    try {
      const handle = await this.getWorkflowHandle(workflowId);
      const result = await handle.query<T>(queryType, ...args);
      
      this.logger.debug(`Query ${queryType} on workflow ${workflowId}`, result);
      return result;
    } catch (error) {
      this.logger.error(`Query failed: ${queryType} on ${workflowId}`, error.stack);
      throw error;
    }
  }

  /**
   * Send a signal to a running workflow
   * 
   * @param workflowId - The workflow ID
   * @param signalName - The signal name defined in workflow
   * @param args - Arguments for the signal
   */
  async signalWorkflow(
    workflowId: string, 
    signalName: string, 
    ...args: any[]
  ): Promise<void> {
    try {
      const handle = await this.getWorkflowHandle(workflowId);
      await handle.signal(signalName, ...args);
      
      this.logger.log(`📨 Signal sent: ${signalName} to workflow ${workflowId}`);
    } catch (error) {
      this.logger.error(`Signal failed: ${signalName} on ${workflowId}`, error.stack);
      throw error;
    }
  }

  /**
   * Cancel a running workflow
   * 
   * @param workflowId - The workflow ID
   */
  async cancelWorkflow(workflowId: string): Promise<void> {
    try {
      const handle = await this.getWorkflowHandle(workflowId);
      await handle.cancel();
      
      this.logger.warn(`🛑 Workflow cancelled: ${workflowId}`);
    } catch (error) {
      this.logger.error(`Cancel failed for workflow ${workflowId}`, error.stack);
      throw error;
    }
  }

  /**
   * Terminate a workflow execution immediately
   * Unlike cancel, terminate doesn't allow cleanup
   * 
   * @param workflowId - The workflow ID
   * @param reason - Reason for termination
   */
  async terminateWorkflow(workflowId: string, reason?: string): Promise<void> {
    try {
      const handle = await this.getWorkflowHandle(workflowId);
      await handle.terminate(reason);
      
      this.logger.warn(`⚠️ Workflow terminated: ${workflowId}`, { reason });
    } catch (error) {
      this.logger.error(`Terminate failed for workflow ${workflowId}`, error.stack);
      throw error;
    }
  }

  /**
   * Get workflow execution result
   * Waits for workflow to complete
   * 
   * @param workflowId - The workflow ID
   * @returns The workflow result
   */
  async getWorkflowResult<T = any>(workflowId: string): Promise<T> {
    try {
      const handle = await this.getWorkflowHandle<T>(workflowId);
      const result = await handle.result();
      
      this.logger.log(`✅ Workflow result retrieved: ${workflowId}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to get result for workflow ${workflowId}`, error.stack);
      throw error;
    }
  }

  /**
   * Describe workflow execution
   * Gets current state and metadata
   * 
   * @param workflowId - The workflow ID
   */
  async describeWorkflow(workflowId: string) {
    try {
      const handle = await this.getWorkflowHandle(workflowId);
      const description = await handle.describe();
      
      return {
        workflowId: description.workflowId,
        runId: description.runId,
        type: description.type,
        status: description.status.name,
        startTime: description.startTime,
        closeTime: description.closeTime,
        execution: description.status,
        memo: description.memo,
        searchAttributes: description.searchAttributes,
      };
    } catch (error: any) {
      this.logger.error(`Describe failed for workflow ${workflowId}`, error?.stack);
      throw error;
    }
  }

  /**
   * List all workflows with filters
   * Useful for admin/monitoring dashboards
   * 
   * @param query - Temporal query string (e.g., "WorkflowType='fundTransferWorkflow'")
   */
  async listWorkflows(query?: string) {
    try {
      const workflows = [];
      
      for await (const workflow of this.client.workflow.list({ query })) {
        workflows.push({
          workflowId: workflow.workflowId,
          runId: workflow.runId,
          type: workflow.type,
          status: workflow.status.name,
          startTime: workflow.startTime,
        });
      }
      
      return workflows;
    } catch (error) {
      this.logger.error('Failed to list workflows', error.stack);
      throw error;
    }
  }
}