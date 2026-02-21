import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { WalletRepoContract } from '../contract/wallet.repo.contract';
import { Wallet } from '../entity/wallet.entity';
import { WalletModel } from '../model/wallet.model';

@Injectable()
export class WalletRepo implements WalletRepoContract {
  constructor(
    @InjectRepository(Wallet) private walletRepo: Repository<Wallet>,
  ) {}

  public async create(wallet: Partial<WalletModel>): Promise<Wallet> {
    return await this.walletRepo.save(wallet);
  }

  public async findById(id: string): Promise<Wallet | null> {
    return await this.walletRepo
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .where('wallet.id = :id', { id })
      .getOne();
  }

  public async findByUserIdAndCurrency(
    userId: string,
    currency: SupportedCurrency,
  ): Promise<Wallet | null> {
    return await this.walletRepo
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .where('user.id = :userId', { userId })
      .andWhere('wallet.currency = :currency', { currency })
      .getOne();
  }

  public async findByUserIdAndCurrencyWithLock(
    userId: string,
    currency: SupportedCurrency,
  ): Promise<Wallet | null> {
    return await this.walletRepo
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .setLock('pessimistic_write')
      .where('user.id = :userId', { userId })
      .andWhere('wallet.currency = :currency', { currency })
      .getOne();
  }

  public async findByIdWithLock(id: string): Promise<Wallet | null> {
    return await this.walletRepo
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .setLock('pessimistic_write')
      .where('wallet.id = :id', { id })
      .getOne();
  }

  public async update(
    id: string,
    wallet: Partial<WalletModel>,
  ): Promise<Wallet | null> {
    await this.walletRepo.update(id, wallet);
    return await this.findById(id);
  }

  public async save(wallet: Wallet): Promise<Wallet> {
    return await this.walletRepo.save(wallet);
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.walletRepo.delete(id);
    return result.affected > 0;
  }
}
