import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { WalletTransactionRepoContract } from '../contract/wallet-transaction.repo.contract';
import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
import { WalletTransaction } from '../entity/wallet-transaction.entity';
import { Wallet } from '../entity/wallet.entity';

@Injectable()
export class WalletTransactionRepo implements WalletTransactionRepoContract {
  constructor(
    @InjectRepository(WalletTransaction)
    private walletTransactionRepo: Repository<WalletTransaction>,
  ) {}

  public async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<WalletTransaction | null> {
    return await this.walletTransactionRepo
      .createQueryBuilder('walletTransaction')
      .leftJoinAndSelect('walletTransaction.wallet', 'wallet')
      .where('walletTransaction.idemPotent = :idempotencyKey', {
        idempotencyKey,
      })
      .getOne();
  }

  public async create(
    data: CreateWalletTransactionDTO,
    wallet: Wallet,
  ): Promise<WalletTransaction> {
    const txn = new WalletTransaction();
    txn.direction = data.direction;
    txn.historyType = data.historyType;
    txn.amount = BigInt(data.amount).toString();
    txn.balanceAfter = BigInt(data.balanceAfter).toString();
    txn.idemPotent = data.idemPotent;
    txn.wallet = wallet;

    return await this.walletTransactionRepo.save(txn);
  }

  public async findById(id: string): Promise<WalletTransaction | null> {
    return await this.walletTransactionRepo
      .createQueryBuilder('walletTransaction')
      .leftJoinAndSelect('walletTransaction.wallet', 'wallet')
      .where('walletTransaction.id = :id', { id })
      .getOne();
  }

  public async findByWalletId(walletId: string): Promise<WalletTransaction[]> {
    return await this.walletTransactionRepo
      .createQueryBuilder('walletTransaction')
      .leftJoinAndSelect('walletTransaction.wallet', 'wallet')
      .where('wallet.id = :walletId', { walletId })
      .orderBy('walletTransaction.createdAt', 'DESC')
      .getMany();
  }

  public async update(
    id: string,
    transaction: Partial<WalletTransaction>,
  ): Promise<WalletTransaction | null> {
    await this.walletTransactionRepo.update(id, transaction);
    return await this.findById(id);
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.walletTransactionRepo.delete(id);
    return result.affected > 0;
  }
}
