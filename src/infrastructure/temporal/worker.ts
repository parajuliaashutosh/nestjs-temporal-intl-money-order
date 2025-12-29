import { Worker } from '@temporalio/worker';
import path from 'path';

async function bootstrap() {
    console.log('⏳ Starting Temporal Worker...'); 
  const worker = await Worker.create({
    taskQueue: 'registration-task-queue',
    workflowsPath: path.join(__dirname, 'workflow'),
    activities: require('./activities'),
  });

  console.log('🚀 Temporal Worker started');
  await worker.run();
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
