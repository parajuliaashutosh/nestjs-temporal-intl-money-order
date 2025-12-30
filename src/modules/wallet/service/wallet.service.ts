import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import { AppException } from '@/src/common/exception/app.exception';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserContract } from '../../user/contract/user.contract';
import { USER_SERVICE } from '../../user/user.constant';
import type { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import { WalletContract } from '../contract/wallet.contract';
import { WalletTopUpDTO } from '../dto/wallet-topup.dto';
import { Wallet } from '../entity/wallet.entity';
import { WALLET_TRANSACTION_SERVICE } from '../wallet.constant';

@Injectable()
export class WalletService implements WalletContract {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletRepository: Repository<Wallet>,
    @Inject(WALLET_TRANSACTION_SERVICE)
    private readonly walletTransactionService: WalletTransactionContract,

    @Inject(USER_SERVICE)
    private readonly userService: UserContract,
  ) {}

  @Transactional()
  public async walletTopUp(data: WalletTopUpDTO): Promise<Wallet> {
    const existingTransaction =
      await this.walletTransactionService.checkIdemPotencyKey(data.id);

    if (existingTransaction) {
      return existingTransaction?.wallet;
    }

    const user = await this.userService.getUserById(data.userId);
    if (!user) {
      throw AppException.badRequest('USER_NOT_FOUND');
    }

    let wallet = await this.walletRepository
      .createQueryBuilder('wallet')
      .leftJoinAndSelect('wallet.user', 'user')
      .where('wallet.user = :userId', { userId: data.userId })
      .getOne();

    if (!wallet) {
      wallet = new Wallet();
      wallet.user = user;
      wallet.balance = BigInt(Math.round(data.amount * 100)).toString();

      return await this.walletRepository.save(wallet);
    } else {
      const current = BigInt(wallet.balance);
      wallet.balance = (current + BigInt(data?.amount)).toString();
      await this.walletRepository.save(wallet);
      return await this.walletRepository.save(wallet);
    }
  }
}
