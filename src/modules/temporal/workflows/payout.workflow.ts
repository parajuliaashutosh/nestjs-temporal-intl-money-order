import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { processPayout } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minute',
});

export async function ausMoneyOrderWorkflow(
  moneyOrderId: string,
): Promise<void> {
  console.log(`[Workflow] Starting for payout process: ${moneyOrderId}`);

  await processPayout(moneyOrderId);

  console.log(`[Workflow] Completed for payout process: ${moneyOrderId}`);
}
