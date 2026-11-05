import { LedgerSystemAccount } from '@/src/common/enum/ledger.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { PostJournalDTO, WalletAccountRef } from '../dto/post-journal.dto';
import { LedgerAccount } from '../entity/ledger-account.entity';
import { LedgerJournal } from '../entity/ledger-journal.entity';

export interface PostedJournal {
  journal: LedgerJournal;
  replayed: boolean;
  balances: Map<string, string>;
}

export interface LedgerContract {
  post(data: PostJournalDTO): Promise<PostedJournal>;
  getWalletAccount(wallet: WalletAccountRef): Promise<LedgerAccount>;
  getSystemAccount(
    account: LedgerSystemAccount,
    currency: SupportedCurrency,
  ): Promise<LedgerAccount>;
  hasJournal(idempotencyKey: string): Promise<boolean>;
}
