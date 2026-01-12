import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { usaScreenReceiver, usaCheckWalletBalance, usaTransferFunds } = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function usaMoneyOrderWorkflow(moneyOrderId: string): Promise<void> {
  console.log(`[Workflow] Starting for: ${moneyOrderId}`);
  
  await usaScreenReceiver(moneyOrderId);
  await usaCheckWalletBalance(moneyOrderId);
  await usaTransferFunds(moneyOrderId);
  
  console.log(`[Workflow] Completed for: ${moneyOrderId}`);
}