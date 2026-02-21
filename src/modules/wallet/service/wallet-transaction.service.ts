import { Inject, Injectable } from '@nestjs/common';
import { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import type { WalletTransactionRepoContract } from '../contract/wallet-transaction.repo.contract';
import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
import { WalletTransaction } from '../entity/wallet-transaction.entity';
import { Wallet } from '../entity/wallet.entity';
import { WALLET_TRANSACTION_REPO } from '../wallet.constant';

@Injectable()
export class WalletTransactionService implements WalletTransactionContract {
  constructor(
    @Inject(WALLET_TRANSACTION_REPO)
    private readonly walletTransactionRepo: WalletTransactionRepoContract,
  ) {}

  checkIdemPotencyKey(
    idempotencyKey: string,
  ): Promise<WalletTransaction | null> {
    return this.walletTransactionRepo.findByIdempotencyKey(idempotencyKey);
  }

  createTransaction(
    data: CreateWalletTransactionDTO,
    wallet: Wallet,
  ): Promise<WalletTransaction> {
    return this.walletTransactionRepo.create(data, wallet);
  }
}
