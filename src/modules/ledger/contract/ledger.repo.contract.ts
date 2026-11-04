import { LedgerAccount } from '../entity/ledger-account.entity';
import { LedgerJournal } from '../entity/ledger-journal.entity';

export interface LedgerRepoContract {
  lockIdempotencyKey(key: string): Promise<void>;
  findJournalByIdempotencyKey(key: string): Promise<LedgerJournal | null>;
  findAccountByCode(code: string): Promise<LedgerAccount | null>;
  insertAccountIfAbsent(account: Partial<LedgerAccount>): Promise<boolean>;
  lockAccounts(ids: string[]): Promise<LedgerAccount[]>;
  updateAccountBalance(id: string, balance: string): Promise<void>;
  saveJournal(journal: LedgerJournal): Promise<LedgerJournal>;
}
