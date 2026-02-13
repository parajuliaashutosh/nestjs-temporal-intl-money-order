import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import {
  WalletHistoryType,
  WalletTxnDirection,
} from '@/src/common/enum/wallet.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Mapper } from '@/src/common/util/mapper';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import Decimal from 'decimal.js';
import { Repository } from 'typeorm';
import type { UserContract } from '../../user/contract/user.contract';
import { USER_SERVICE } from '../../user/user.constant';
import type { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import { WalletContract } from '../contract/wallet.contract';
import { WalletTopUpDTO } from '../dto/wallet-topup.dto';
import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
import { WalletUpdateBalanceDTO } from '../dto/wallet-update-balance.dto';
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
    console.log('🚀 ~ WalletService ~ walletTopUp ~ data:', data);

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

  public async updateBalance(data: WalletUpdateBalanceDTO): Promise<Wallet> {
    const logger = new Logger(WalletService.name);
    logger.log(`Updating wallet balance: ${JSON.stringify(data)}`);

    // Check idempotency first to prevent duplicate transactions
    const existingTransaction =
      await this.walletTransactionService.checkIdemPotencyKey(
        data.idempotencyKey,
      );

    if (existingTransaction) {
      logger.log(`Idempotent transaction found: ${data.idempotencyKey}`);
      return existingTransaction.wallet;
    }

    // Acquire pessimistic lock on wallet to prevent race conditions
    const wallet = await this.walletRepository
      .createQueryBuilder('wallet')
      .setLock('pessimistic_write')
      .where('wallet.id = :walletId', { walletId: data.walletId })
      .getOne();

    if (!wallet) {
      throw AppException.notFound('WALLET_NOT_FOUND');
    }

    const currentBalance = new Decimal(wallet.balance);
    const amount = new Decimal(data.amount);
    let newBalance = new Decimal(0);

    if (data.direction === WalletTxnDirection.DEBIT) {
      // Deduct from wallet
      if (currentBalance.lessThan(amount)) {
        throw AppException.badRequest('INSUFFICIENT_WALLET_BALANCE');
      }
      newBalance = currentBalance.minus(amount);
    } else if (data.direction === WalletTxnDirection.CREDIT) {
      // Add to wallet (CREDIT)
      newBalance = currentBalance.plus(amount);
    } else {
      throw AppException.badRequest('INVALID_TRANSACTION_DIRECTION');
    }

    wallet.balance = newBalance.toString();
    await this.walletRepository.save(wallet);

    // Create transaction record
    const transactionPayload: CreateWalletTransactionDTO = {
      direction: data.direction,
      historyType: data.historyType,
      amount: data.amount,
      balanceAfter: wallet.balance,
      idemPotent: data.idempotencyKey,
    };

    await this.walletTransactionService.createTransaction(
      transactionPayload,
      wallet,
    );

    logger.log(
      `✅ Wallet ${data.walletId} balance updated: ${currentBalance.toString()} -> ${newBalance.toString()} (${data.direction})`,
    );

    return wallet;
  }
}
