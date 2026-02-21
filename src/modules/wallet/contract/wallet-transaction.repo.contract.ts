import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
import { WalletTransaction } from '../entity/wallet-transaction.entity';
import { Wallet } from '../entity/wallet.entity';

export interface WalletTransactionRepoContract {
  findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<WalletTransaction | null>;
  create(
    data: CreateWalletTransactionDTO,
    wallet: Wallet,
  ): Promise<WalletTransaction>;
  findById(id: string): Promise<WalletTransaction | null>;
  findByWalletId(walletId: string): Promise<WalletTransaction[]>;
  update(
    id: string,
    transaction: Partial<WalletTransaction>,
  ): Promise<WalletTransaction | null>;
  delete(id: string): Promise<boolean>;
}
