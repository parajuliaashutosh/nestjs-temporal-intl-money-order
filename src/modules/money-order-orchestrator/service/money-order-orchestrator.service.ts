import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { TemporalClientService } from '../../infrastructure/temporal/client/temporal-client.service';
import { WORKFLOW_CLIENT, WORKFLOWS } from '../../infrastructure/temporal/workflow.constant';
import { CreateMoneyOrderDTO } from '../../money-order/dto/create-money-order.dto';
import { MONEY_ORDER_FACTORY } from '../../money-order/money-order.constant';
import { MoneyOrderFactory } from '../../money-order/service/money-order.factory';

@Injectable()
export class MoneyOrderOrchestratorService {
  constructor(
    @Inject(MONEY_ORDER_FACTORY)
    private readonly moneyOrderFactory: MoneyOrderFactory,

    @Inject(WORKFLOW_CLIENT)
    private readonly workflowClient: TemporalClientService,
  ) {}

  public async createMoneyOrder(
    data: CreateMoneyOrderDTO,
    countryCode: SupportedCountry,
  ) {
    const moneyOrderService =
      this.moneyOrderFactory.getMoneyOrderService(countryCode);
    const resp = await moneyOrderService.createMoneyOrder(data);

    const workflow = await this.workflowClient.startWorkflow(
      WORKFLOWS.USA_MONEY_ORDER,
      [resp.id],
      'money-order-task-queue'
    );

    Logger.log(
      `Started workflow ${workflow.workflowId} for Money Order ID: ${resp.id}`,
    );

    return resp;
  }
}
