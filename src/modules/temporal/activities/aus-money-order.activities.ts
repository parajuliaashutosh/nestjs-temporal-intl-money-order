import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { MoneyOrderFactoryContract } from '@/src/modules/money-order/contract/money-order-factory.contract';
import { MoneyOrderContract } from '@/src/modules/money-order/contract/money-order.contract';
import { MONEY_ORDER_FACTORY } from '@/src/modules/money-order/money-order.constant';
import { TemporalClientService } from '../client/temporal-client.service';
import { WORKFLOW_CLIENT, WORKFLOWS } from '../workflow.constant';
import { getAppContext } from './shared-app-context';

let moneyOrderService: MoneyOrderContract | null = null;
let workflowClient: TemporalClientService | null = null;

async function getInstances() {
  if (!moneyOrderService || !workflowClient) {
    const app = await getAppContext();
    const factory: MoneyOrderFactoryContract = app.get(MONEY_ORDER_FACTORY);
    moneyOrderService = factory.getMoneyOrderService(SupportedCountry.AUS);
    workflowClient = app.get(WORKFLOW_CLIENT);
  }
  return { moneyOrderService, workflowClient };
}

export async function ausScreenReceiver(
  moneyOrderId: string,
): Promise<boolean> {
  const { moneyOrderService } = await getInstances();
  console.log('========================================');
  console.log('🔍 ACTIVITY: screenReceiver');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await moneyOrderService.screenReceiver(moneyOrderId);

  return;
}

export async function ausCheckWalletBalance(
  moneyOrderId: string,
): Promise<boolean> {
  const { moneyOrderService } = await getInstances();
  console.log('========================================');
  console.log('💰 ACTIVITY: checkWalletBalance');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await moneyOrderService.checkWalletBalance(moneyOrderId);

  return;
}

export async function ausTransferFunds(moneyOrderId: string): Promise<boolean> {
  const { moneyOrderService } = await getInstances();
  console.log('========================================');
  console.log('💸 ACTIVITY: transferFunds');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await moneyOrderService.transferFunds(moneyOrderId);

  return;
}

export async function ausPayoutFunds(moneyOrderId: string): Promise<boolean> {
  const { workflowClient } = await getInstances();
  console.log('========================================');
  console.log('💸 ACTIVITY: payoutFunds');
  console.log('   Money Order ID:', moneyOrderId);
  console.log('========================================');

  await workflowClient.startWorkflow(
    WORKFLOWS.PAYOUT,
    [moneyOrderId],
    process.env.TEMPORAL_TASK_QUEUE,
  );

  return;
}
