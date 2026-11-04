import {
  LedgerEntrySide,
  LedgerJournalType,
} from '@/src/common/enum/ledger.enum';
import { LedgerAccount } from '../entity/ledger-account.entity';

export interface JournalLineDTO {
  account: LedgerAccount;
  side: LedgerEntrySide;
  amount: bigint;
}

export interface PostJournalDTO {
  type: LedgerJournalType;
  idempotencyKey: string;
  reference?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  lines: JournalLineDTO[];
}

export interface WalletAccountRef {
  id: string;
  currency: LedgerAccount['currency'];
  balance: string;
}
