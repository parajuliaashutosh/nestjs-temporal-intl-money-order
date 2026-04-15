import { proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities';

const {
  usaScreenReceiver,
  usaCheckWalletBalance,
  usaTransferFunds,
  usaPayoutFunds,
} = proxyActivities<typeof activities>({
  startToCloseTimeout: '1 minute',
});

export async function usaMoneyOrderWorkflow(
  moneyOrderId: string,
): Promise<void> {
  console.log(`[Workflow] Starting for: ${moneyOrderId}`);

  await usaScreenReceiver(moneyOrderId);
  await sleep('5 minutes');
  await usaCheckWalletBalance(moneyOrderId);
  await usaTransferFunds(moneyOrderId);
  await usaPayoutFunds(moneyOrderId);
  console.log(`[Workflow] Completed for: ${moneyOrderId}`);
}
