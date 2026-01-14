import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
import { WalletTransaction } from '../entity/wallet-transaction.entity';
import { Wallet } from '../entity/wallet.entity';

export interface WalletTransactionContract {
  checkIdemPotencyKey(
    idempotencyKey: string,
  ): Promise<WalletTransaction | null>;

  createTransaction(
    data: CreateWalletTransactionDTO,
    wallet: Wallet,
  ): Promise<WalletTransaction>;
}
