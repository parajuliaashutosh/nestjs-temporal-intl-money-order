import { CACHE_KEYS } from '@/src/common/keys/cache.keys';
import { DistributedLockService } from '@/src/common/lock/distributed-lock.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { MoneyOrderRepoContract } from '../contract/money-order.repo.contract';
import { MONEY_ORDER_REPO } from '../money-order.constant';

const JOB_NAME = 'refresh-money-order-analytics';
const LOCK_TTL_MS = 5 * 60 * 1000;

@Injectable()
export class MoneyOrderAnalyticsRefreshJob {
  private readonly logger = new Logger(MoneyOrderAnalyticsRefreshJob.name);

  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,
    private readonly lockService: DistributedLockService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: JOB_NAME })
  async refresh(): Promise<void> {
    const isLeader = await this.lockService.acquire(
      CACHE_KEYS.cronLeaderLock(JOB_NAME),
      LOCK_TTL_MS,
    );

    if (!isLeader) {
      this.logger.log(
        'Skipping money_order_analytics refresh — another instance is the leader for this tick',
      );
      return;
    }

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
