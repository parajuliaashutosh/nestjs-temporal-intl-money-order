import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
import { WalletTransaction } from '../entity/wallet-transaction.entity';
import { Wallet } from '../entity/wallet.entity';

@Injectable()
export class WalletTransactionService implements WalletTransactionContract {
  constructor(
    @InjectRepository(WalletTransaction)
    private readonly walletTransactionRepository: Repository<WalletTransaction>,
  ) {}

  checkIdemPotencyKey(
    idempotencyKey: string,
  ): Promise<WalletTransaction | null> {
    return this.walletTransactionRepository
      .createQueryBuilder('walletTransaction')
      .leftJoinAndSelect('walletTransaction.wallet', 'wallet')
      .where('walletTransaction.idemPotent = :idempotencyKey', {
        idempotencyKey,
      })
      .getOne();
  }

  createTransaction(data: CreateWalletTransactionDTO, wallet: Wallet): Promise<WalletTransaction> {
    const txn = new WalletTransaction();
    txn.direction = data.direction;
    txn.historyType = data.historyType;
    txn.amount = (BigInt(data.amount)).toString();
    txn.balanceAfter = (BigInt(data.balanceAfter)).toString();
    txn.idemPotent = data.idemPotent;
    txn.wallet = wallet;
    return this.walletTransactionRepository.save(txn);
  }
}
