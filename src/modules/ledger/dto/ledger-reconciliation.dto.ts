import { LedgerReconciliationBreakType } from '@/src/common/enum/ledger.enum';

export interface LedgerReconciliationBreak {
  type: LedgerReconciliationBreakType;
  subject: string;
  expected: string;
  actual: string;
}

export interface LedgerReconciliationReport {
  accountsChecked: number;
  journalsChecked: number;
  walletsPendingOpening: number;
  breaks: LedgerReconciliationBreak[];
}
