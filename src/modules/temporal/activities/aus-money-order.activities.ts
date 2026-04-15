import { AppModule } from '@/src/app.module';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { MoneyOrderFactoryContract } from '@/src/modules/money-order/contract/money-order-factory.contract';
import { MoneyOrderContract } from '@/src/modules/money-order/contract/money-order.contract';
import { MONEY_ORDER_FACTORY } from '@/src/modules/money-order/money-order.constant';
import { NestFactory } from '@nestjs/core';
import { TemporalClientService } from '../client/temporal-client.service';
import { WORKFLOW_CLIENT, WORKFLOWS } from '../workflow.constant';

let activitiesInstance: MoneyOrderContract | null;

async function getActivitiesInstance() {
  if (!activitiesInstance) {
    const app = await NestFactory.createApplicationContext(AppModule);
    const factory: MoneyOrderFactoryContract = app.get(MONEY_ORDER_FACTORY);
    activitiesInstance = factory.getMoneyOrderService(SupportedCountry.AUS);
  }
  return activitiesInstance;
}

let workflowClientInstance: TemporalClientService = null;

async function getWorkflowClientInstance() {
  if (!workflowClientInstance) {
    const app = await NestFactory.createApplicationContext(AppModule);
    workflowClientInstance = app.get(WORKFLOW_CLIENT);
  }
  return workflowClientInstance;
}

export async function ausScreenReceiver(
  moneyOrderId: string,
): Promise<boolean> {
  const activities = await getActivitiesInstance();
  console.log('========================================');
  console.log('🔍 ACTIVITY: screenReceiver');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await activities.screenReceiver(moneyOrderId);

  return;
}

export async function ausCheckWalletBalance(
  moneyOrderId: string,
): Promise<boolean> {
  const activities = await getActivitiesInstance();
  console.log('========================================');
  console.log('💰 ACTIVITY: checkWalletBalance');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await activities.checkWalletBalance(moneyOrderId);

  return;
}

export async function ausTransferFunds(moneyOrderId: string): Promise<boolean> {
  const activities = await getActivitiesInstance();
  console.log('========================================');
  console.log('💸 ACTIVITY: transferFunds');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await activities.transferFunds(moneyOrderId);

  return;
}

export async function ausPayoutFunds(moneyOrderId: string): Promise<boolean> {
  const activities = await getWorkflowClientInstance();
  console.log('========================================');
  console.log('💸 ACTIVITY: payoutFunds');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await activities.startWorkflow(
    WORKFLOWS.PAYOUT,
    [moneyOrderId],
    process.env.TEMPORAL_TASK_QUEUE,
  );

  return;
}
