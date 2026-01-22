import { registerAs } from '@nestjs/config';

export default registerAs('temporal', () => ({
  connection: {
    address: process.env.TEMPORAL_ADDRESS || 'localhost:7233',
  },
  namespace: process.env.TEMPORAL_NAMESPACE || 'money-order',
  taskQueue: process.env.TEMPORAL_TASK_QUEUE || 'money-order-task-queue',
  workflowOptions: {
    workflowExecutionTimeout: '10m',
    workflowRunTimeout: '5m',
    workflowTaskTimeout: '30s',
  },
  activityOptions: {
    startToCloseTimeout: '30s',
    retry: {
      initialInterval: '1s',
      maximumInterval: '10s',
      backoffCoefficient: 2,
      maximumAttempts: 3,
    },
  },
}));