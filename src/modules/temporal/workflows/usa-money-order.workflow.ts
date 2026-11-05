import { log, patched, proxyActivities, sleep } from '@temporalio/workflow';
import type * as activities from '../activities';
import { HALT_ON_FAILED_CHECK_PATCH } from './patches';

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
  log.info(`Money order ${moneyOrderId} started`);

  const haltOnFailedCheck = patched(HALT_ON_FAILED_CHECK_PATCH);

  const screened = await usaScreenReceiver(moneyOrderId);
  if (haltOnFailedCheck && !screened) {
    log.info(`Money order ${moneyOrderId} halted: screening failed`);
    return;
  }
  await sleep('5 minutes');

  const hasBalance = await usaCheckWalletBalance(moneyOrderId);
  if (haltOnFailedCheck && !hasBalance) {
    log.info(`Money order ${moneyOrderId} halted: insufficient balance`);
    return;
  }

  const transferred = await usaTransferFunds(moneyOrderId);
  if (haltOnFailedCheck && !transferred) {
    log.info(`Money order ${moneyOrderId} halted: transfer refused`);
    return;
  }

  await usaPayoutFunds(moneyOrderId);

  log.info(`Money order ${moneyOrderId} handed off to payout`);
}
