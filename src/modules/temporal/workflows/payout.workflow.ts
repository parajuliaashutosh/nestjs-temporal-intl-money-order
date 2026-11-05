import { log, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';

const { processPayout, completeMoneyOrder } = proxyActivities<
  typeof activities
>({
  startToCloseTimeout: '5 minute',
});

export interface PayoutWorkflowResult {
  moneyOrderId: string;
  payoutSucceeded: boolean;
  moneyOrderCompleted: boolean;
  payoutData: Record<string, any>;
  completedAt: string;
}

export async function payoutWorkflow(
  moneyOrderId: string,
): Promise<PayoutWorkflowResult> {
  log.info(`Payout for money order ${moneyOrderId} started`);

  const { success, data } = await processPayout(moneyOrderId);

  const moneyOrderCompleted = success
    ? await completeMoneyOrder(moneyOrderId)
    : false;

  log.info(`Payout for money order ${moneyOrderId} finished`);

  return {
    moneyOrderId,
    payoutSucceeded: success,
    moneyOrderCompleted,
    payoutData: data,
    completedAt: new Date().toISOString(),
  };
}
