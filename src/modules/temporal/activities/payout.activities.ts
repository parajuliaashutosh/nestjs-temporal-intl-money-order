import { AppModule } from '@/src/app.module';
import { NestFactory } from '@nestjs/core';
import { PayoutContract } from '../../payout/contract/payout.contract';
import { PAYOUT_SERVICE } from '../../payout/payout.constant';

let activitiesInstance: PayoutContract | null;

async function getActivitiesInstance() {
  if (!activitiesInstance) {
    const app = await NestFactory.createApplicationContext(AppModule);
    activitiesInstance = app.get(PAYOUT_SERVICE);
  }
  return activitiesInstance;
}

export async function processPayout(moneyOrderId: string): Promise<boolean> {
  const activities = await getActivitiesInstance();
  console.log('========================================');
  console.log('🔍 ACTIVITY: processPayout');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await activities.startPayout(moneyOrderId);

  return;
}
