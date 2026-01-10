import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { screenReceiver } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function usaMoneyOrderWorkflow(moneyOrderId: string): Promise<void> {
  console.log(`[Workflow] Starting for: ${moneyOrderId}`);
  
  const passed = await screenReceiver(moneyOrderId);
  
  if (!passed) {
    throw new Error('SCREENING_FAILED');
  }
  
  console.log(`[Workflow] Completed for: ${moneyOrderId}`);
}