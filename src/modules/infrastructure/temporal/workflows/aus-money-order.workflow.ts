import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { ausScreenReceiver, ausCheckWalletBalance, ausTransferFunds } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function ausMoneyOrderWorkflow(moneyOrderId: string): Promise<void> {
  console.log(`[Workflow] Starting for: ${moneyOrderId}`);
  
  await ausScreenReceiver(moneyOrderId);
  // await UTIL_FUNCTIONS.delay(5*60*1000); // 5 minutes delay
  await ausCheckWalletBalance(moneyOrderId);
  await ausTransferFunds(moneyOrderId);
  
  console.log(`[Workflow] Completed for: ${moneyOrderId}`);
}

