import { log, patched, proxyActivities } from '@temporalio/workflow';
import type * as activities from '../activities';
import { HALT_ON_FAILED_CHECK_PATCH } from './patches';

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
  log.info(`Money order ${moneyOrderId} started`);

  const haltOnFailedCheck = patched(HALT_ON_FAILED_CHECK_PATCH);

  const screened = await ausScreenReceiver(moneyOrderId);
  if (haltOnFailedCheck && !screened) {
    log.info(`Money order ${moneyOrderId} halted: screening failed`);
    return;
  }

  const hasBalance = await ausCheckWalletBalance(moneyOrderId);
  if (haltOnFailedCheck && !hasBalance) {
    log.info(`Money order ${moneyOrderId} halted: insufficient balance`);
    return;
  }

  const transferred = await ausTransferFunds(moneyOrderId);
  if (haltOnFailedCheck && !transferred) {
    log.info(`Money order ${moneyOrderId} halted: transfer refused`);
    return;
  }

  await ausPayoutFunds(moneyOrderId);

  log.info(`Money order ${moneyOrderId} handed off to payout`);
}
