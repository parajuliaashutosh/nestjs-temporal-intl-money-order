import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { MoneyOrderRepoContract } from '../contract/money-order.repo.contract';
import { MONEY_ORDER_REPO } from '../money-order.constant';

/**
 * Keeps the money_order_analytics materialized view fresh by refreshing it
 * once an hour. The analytics endpoint reads the view directly, so this is
 * the only thing standing between served numbers and reality.
 */
@Injectable()
export class MoneyOrderAnalyticsRefreshJob {
  private readonly logger = new Logger(MoneyOrderAnalyticsRefreshJob.name);

  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: 'refresh-money-order-analytics' })
  async refresh(): Promise<void> {
    try {
      await this.moneyOrderRepo.refreshAnalytics();
      this.logger.log('Refreshed money_order_analytics materialized view');
    } catch (error) {
      this.logger.error(
        'Failed to refresh money_order_analytics materialized view',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
