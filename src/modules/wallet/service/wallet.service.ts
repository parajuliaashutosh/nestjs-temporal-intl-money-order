import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import {
  WalletHistoryType,
  WalletTxnDirection,
} from '@/src/common/enum/wallet.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Mapper } from '@/src/common/util/mapper';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { UserContract } from '../../user/contract/user.contract';
import { USER_SERVICE } from '../../user/user.constant';
import type { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import { WalletContract } from '../contract/wallet.contract';
import { WalletTopUpDTO } from '../dto/wallet-topup.dto';
import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
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
  console.log("🚀 ~ WalletService ~ walletTopUp ~ data:", data);
  
  // Validate user exists first
  const user = await this.userService.getUserById(data.userId);
  if (!user) {
    throw AppException.badRequest('USER_NOT_FOUND');
  }

  // Acquire lock BEFORE checking idempotency to prevent race conditions
  let wallet = await this.walletRepository
    .createQueryBuilder('wallet')
    .leftJoinAndSelect('wallet.user', 'user')
    .setLock('pessimistic_write')
    .where('user.id = :userId', { userId: data.userId })
    .andWhere('wallet.currency = :currency', {
      currency: Mapper.countryToCurrencyMap(data.country),
    })
    .getOne();

  // Check idempotency AFTER acquiring lock
  const existingTransaction =
    await this.walletTransactionService.checkIdemPotencyKey(data.id);

  if (existingTransaction) {
    return existingTransaction?.wallet;
  }

  console.log('Current Wallet Balance:', wallet?.balance);
  
  // Convert amount to bigint (assuming data.amount is already in cents)
  const amountToAdd = BigInt(Math.floor(data.amount)); // Use floor instead of round
  
  if (!wallet) {
    wallet = new Wallet();
    wallet.user = user;
    wallet.currency = Mapper.countryToCurrencyMap(data.country);
    wallet.balance = amountToAdd.toString();
    wallet = await this.walletRepository.save(wallet);
  } else {
    const currentBalance = BigInt(wallet.balance);
    wallet.balance = (currentBalance + amountToAdd).toString();
    wallet = await this.walletRepository.save(wallet);
  }

  const payload: CreateWalletTransactionDTO = {
    direction: WalletTxnDirection.CREDIT,
    historyType: WalletHistoryType.TOP_UP,
    amount: amountToAdd.toString(),
    balanceAfter: wallet.balance,
    idemPotent: data.id,
  };

  await this.walletTransactionService.createTransaction(payload, wallet);
  return wallet;
}
}
