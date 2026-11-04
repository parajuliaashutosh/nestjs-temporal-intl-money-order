import type { LedgerReconciliationReport } from '../dto/ledger-reconciliation.dto';
import { LedgerReconciliation } from '../entity/ledger-reconciliation.entity';

export interface LedgerReconciliationRepoContract {
  runChecks(): Promise<LedgerReconciliationReport>;
  saveRun(run: Partial<LedgerReconciliation>): Promise<LedgerReconciliation>;
}
