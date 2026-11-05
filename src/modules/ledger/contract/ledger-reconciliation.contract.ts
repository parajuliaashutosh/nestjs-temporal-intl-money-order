import { LedgerReconciliation } from '../entity/ledger-reconciliation.entity';

export interface LedgerReconciliationContract {
  reconcile(): Promise<LedgerReconciliation>;
}
