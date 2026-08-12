import { proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { processPayout } = proxyActivities<typeof activities>({
  startToCloseTimeout: '5 minute',
});

export interface PayoutWorkflowResult {
  moneyOrderId: string;
  payoutSucceeded: boolean;
  payoutData: Record<string, any>;
  completedAt: string;
}

export async function payoutWorkflow(
  moneyOrderId: string,
): Promise<PayoutWorkflowResult> {
  console.log(`[Workflow] Starting for payout process: ${moneyOrderId}`);

  const { success, data } = await processPayout(moneyOrderId);

  console.log(`[Workflow] Completed for payout process: ${moneyOrderId}`);

  return {
    moneyOrderId,
    payoutSucceeded: success,
    payoutData: data,
    completedAt: new Date().toISOString(),
  };
}
