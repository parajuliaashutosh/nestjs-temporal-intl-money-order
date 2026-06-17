import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { MoneyOrderRepoContract } from '../../money-order/contract/money-order.repo.contract';
import { CreateMoneyOrderDTO } from '../../money-order/dto/create-money-order.dto';
import { FilterMoneyOrdersDTO } from '../../money-order/dto/filter-money-orders.dto';
import type { MoneyOrderAnalyticsResult } from '../../money-order/dto/money-order-analytics.dto';
import type { MoneyOrder } from '../../money-order/entity/money-order.entity';
import { MONEY_ORDER_FACTORY, MONEY_ORDER_REPO } from '../../money-order/money-order.constant';
import type { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { MoneyOrderFactory } from '../../money-order/service/money-order.factory';
import { TemporalClientService } from '../../temporal/client/temporal-client.service';
import {
  WORKFLOW_CLIENT,
  workflowBYCountry,
} from '../../temporal/workflow.constant';

@Injectable()
export class MoneyOrderOrchestratorService {
  constructor(
    @Inject(MONEY_ORDER_FACTORY)
    private readonly moneyOrderFactory: MoneyOrderFactory,

    @Inject(WORKFLOW_CLIENT)
    private readonly workflowClient: TemporalClientService,

    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,

    private readonly configService: ConfigService,
  ) {}

  public async createMoneyOrder(
    data: CreateMoneyOrderDTO,
    countryCode: SupportedCountry,
  ) {
    const moneyOrderService =
      this.moneyOrderFactory.getMoneyOrderService(countryCode);
    const resp = await moneyOrderService.createMoneyOrder(data);

    const taskQueue = this.configService.getOrThrow<string>(
      'TEMPORAL_TASK_QUEUE',
    );

    const workflow = await this.workflowClient.startWorkflow(
      workflowBYCountry(countryCode),
      [resp.id],
      taskQueue,
    );

    Logger.log(
      `Started workflow ${workflow.workflowId} for Money Order ID: ${resp.id}`,
    );

    return resp;
  }

  public async filterMoneyOrders(filter: FilterMoneyOrdersDTO): Promise<DataAndCount<MoneyOrder[]>> {
    return this.moneyOrderRepo.filter(filter);
  }

  public async getAnalytics(countryCode: SupportedCountry): Promise<MoneyOrderAnalyticsResult> {
    return this.moneyOrderRepo.getAnalytics(countryCode);
  }

  public async getMoneyOrderById(id: string, countryCode: SupportedCountry): Promise<MoneyOrder> {
    const moneyOrder = await this.moneyOrderRepo.findById(id);
    if (!moneyOrder || moneyOrder.user?.country !== countryCode)
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    return moneyOrder;
  }
}
