import { LedgerReconciliationStatus } from '@/src/common/enum/ledger.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LedgerReconciliationContract } from '../contract/ledger-reconciliation.contract';
import type { LedgerReconciliationRepoContract } from '../contract/ledger-reconciliation.repo.contract';
import { LedgerReconciliation } from '../entity/ledger-reconciliation.entity';
import { LEDGER_RECONCILIATION_REPO } from '../ledger.constant';

@Injectable()
export class LedgerReconciliationService implements LedgerReconciliationContract {
  private readonly logger = new Logger(LedgerReconciliationService.name);

  constructor(
    @Inject(LEDGER_RECONCILIATION_REPO)
    private readonly reconciliationRepo: LedgerReconciliationRepoContract,
  ) {}

  public async reconcile(): Promise<LedgerReconciliation> {
    const startedAt = Date.now();
    const report = await this.reconciliationRepo.runChecks();

    const status = report.breaks.length
      ? LedgerReconciliationStatus.FAILED
      : LedgerReconciliationStatus.PASSED;

    const run = await this.reconciliationRepo.saveRun({
      status,
      accountsChecked: report.accountsChecked,
      journalsChecked: report.journalsChecked,
      walletsPendingOpening: report.walletsPendingOpening,
      breakCount: report.breaks.length,
      breaks: report.breaks,
      durationMs: Date.now() - startedAt,
    });

    const summary = `${report.accountsChecked} accounts, ${report.journalsChecked} journals, ${report.walletsPendingOpening} wallets not yet in the ledger`;

    if (status === LedgerReconciliationStatus.FAILED) {
      this.logger.error(
        `Ledger reconciliation ${run.id} found ${report.breaks.length} break(s) across ${summary}: ${JSON.stringify(report.breaks)}`,
      );
    } else {
      this.logger.log(`Ledger reconciliation ${run.id} passed: ${summary}`);
    }

    return run;
  }
}
