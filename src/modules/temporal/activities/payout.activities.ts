import { PayoutContract } from '../../payout/contract/payout.contract';
import { PAYOUT_SERVICE } from '../../payout/payout.constant';
import { getAppContext } from './shared-app-context';

let activitiesInstance: PayoutContract | null;

async function getActivitiesInstance() {
  if (!activitiesInstance) {
    const app = await getAppContext();
    activitiesInstance = app.get(PAYOUT_SERVICE);
  }
  return activitiesInstance;
}

export async function processPayout(
  moneyOrderId: string,
): Promise<{ success: boolean; data: Record<string, any> }> {
  const activities = await getActivitiesInstance();
  console.log('========================================');
  console.log('🔍 ACTIVITY: processPayout');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  return await activities.startPayout(moneyOrderId);
}
