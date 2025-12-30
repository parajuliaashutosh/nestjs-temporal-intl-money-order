import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import { WalletTransaction } from '../entity/wallet-transaction.entity';

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
}
