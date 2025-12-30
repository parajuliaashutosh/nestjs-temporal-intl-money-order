import { WalletTransaction } from '../entity/wallet-transaction.entity';

export interface WalletTransactionContract {
  checkIdemPotencyKey(
    idempotencyKey: string,
  ): Promise<WalletTransaction | null>;
}
