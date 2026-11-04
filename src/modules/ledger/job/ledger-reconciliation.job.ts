import { CACHE_KEYS } from '@/src/common/keys/cache.keys';
import { DistributedLockService } from '@/src/common/lock/distributed-lock.service';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import type { LedgerReconciliationContract } from '../contract/ledger-reconciliation.contract';
import { LEDGER_RECONCILIATION_SERVICE } from '../ledger.constant';

const JOB_NAME = 'ledger-reconciliation';
const LOCK_TTL_MS = 10 * 60 * 1000;

@Injectable()
export class LedgerReconciliationJob {
  private readonly logger = new Logger(LedgerReconciliationJob.name);

  constructor(
    @Inject(LEDGER_RECONCILIATION_SERVICE)
    private readonly reconciliationService: LedgerReconciliationContract,
    private readonly lockService: DistributedLockService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR, { name: JOB_NAME })
  async run(): Promise<void> {
    const isLeader = await this.lockService.acquire(
      CACHE_KEYS.cronLeaderLock(JOB_NAME),
      LOCK_TTL_MS,
    );

    if (!isLeader) {
      this.logger.log(
        'Skipping ledger reconciliation, another instance is the leader for this tick',
      );
      return;
    }

    try {
      await this.reconciliationService.reconcile();
    } catch (error) {
      this.logger.error(
        'Ledger reconciliation did not complete',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }
}
