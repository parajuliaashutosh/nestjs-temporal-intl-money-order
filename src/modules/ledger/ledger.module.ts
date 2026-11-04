import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LedgerAccount } from './entity/ledger-account.entity';
import { LedgerEntry } from './entity/ledger-entry.entity';
import { LedgerJournal } from './entity/ledger-journal.entity';
import { LedgerReconciliation } from './entity/ledger-reconciliation.entity';
import { LedgerReconciliationJob } from './job/ledger-reconciliation.job';
import {
  LEDGER_RECONCILIATION_REPO,
  LEDGER_RECONCILIATION_SERVICE,
  LEDGER_REPO,
  LEDGER_SERVICE,
} from './ledger.constant';
import { LedgerReconciliationRepo } from './repo/ledger-reconciliation.repo';
import { LedgerRepo } from './repo/ledger.repo';
import { LedgerReconciliationService } from './service/ledger-reconciliation.service';
import { LedgerService } from './service/ledger.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      LedgerAccount,
      LedgerJournal,
      LedgerEntry,
      LedgerReconciliation,
    ]),
  ],
  providers: [
    { provide: LEDGER_SERVICE, useClass: LedgerService },
    { provide: LEDGER_REPO, useClass: LedgerRepo },
    {
      provide: LEDGER_RECONCILIATION_SERVICE,
      useClass: LedgerReconciliationService,
    },
    {
      provide: LEDGER_RECONCILIATION_REPO,
      useClass: LedgerReconciliationRepo,
    },
    LedgerReconciliationJob,
  ],
  exports: [LEDGER_SERVICE, LEDGER_RECONCILIATION_SERVICE],
})
export class LedgerModule {}
