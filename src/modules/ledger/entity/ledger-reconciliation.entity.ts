import Base from '@/src/common/entity/base.entity';
import { LedgerReconciliationStatus } from '@/src/common/enum/ledger.enum';
import { Column, Entity } from 'typeorm';
import type { LedgerReconciliationBreak } from '../dto/ledger-reconciliation.dto';

@Entity('ledger_reconciliation')
export class LedgerReconciliation extends Base {
  @Column({ type: 'enum', enum: LedgerReconciliationStatus })
  status: LedgerReconciliationStatus;

  @Column({ name: 'accounts_checked', type: 'int' })
  accountsChecked: number;

  @Column({ name: 'journals_checked', type: 'int' })
  journalsChecked: number;

  @Column({ name: 'wallets_pending_opening', type: 'int' })
  walletsPendingOpening: number;

  @Column({ name: 'break_count', type: 'int' })
  breakCount: number;

  @Column({ type: 'jsonb' })
  breaks: LedgerReconciliationBreak[];

  @Column({ name: 'duration_ms', type: 'int' })
  durationMs: number;
}
