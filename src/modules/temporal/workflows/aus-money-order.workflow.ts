import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  ausScreenReceiver,
  ausCheckWalletBalance,
  ausTransferFunds,
  ausPayoutFunds,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function ausMoneyOrderWorkflow(
  moneyOrderId: string,
): Promise<void> {
  console.log(`[Workflow] Starting for: ${moneyOrderId}`);

  await ausScreenReceiver(moneyOrderId);
  await ausCheckWalletBalance(moneyOrderId);
  await ausTransferFunds(moneyOrderId);
  await ausPayoutFunds(moneyOrderId);

  console.log(`[Workflow] Completed for: ${moneyOrderId}`);
}
