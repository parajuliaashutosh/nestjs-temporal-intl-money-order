import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import {
  WalletHistoryType,
  WalletTxnDirection,
} from '@/src/common/enum/wallet.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Mapper } from '@/src/common/util/mapper';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { OptimisticLockVersionMismatchError } from 'typeorm';
import type { UserContract } from '../../user/contract/user.contract';
import { USER_SERVICE } from '../../user/user.constant';
import type { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import { WalletContract } from '../contract/wallet.contract';
import type { WalletRepoContract } from '../contract/wallet.repo.contract';
import { WalletTopUpDTO } from '../dto/wallet-topup.dto';
import { CreateWalletTransactionDTO } from '../dto/wallet-transaction/create-wallet-transaction.dto';
import { WalletUpdateBalanceDTO } from '../dto/wallet-update-balance.dto';
import { Wallet } from '../entity/wallet.entity';
import { WALLET_REPO, WALLET_TRANSACTION_SERVICE } from '../wallet.constant';

const MAX_OPTIMISTIC_RETRIES = 5;

@Injectable()
export class WalletService implements WalletContract {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    @Inject(WALLET_REPO)
    private readonly walletRepo: WalletRepoContract,
    @Inject(WALLET_TRANSACTION_SERVICE)
    private readonly walletTransactionService: WalletTransactionContract,
    @Inject(USER_SERVICE)
    private readonly userService: UserContract,
  ) {}

  public async walletTopUp(data: WalletTopUpDTO): Promise<Wallet> {
    for (let attempt = 1; attempt <= MAX_OPTIMISTIC_RETRIES; attempt++) {
      try {
        return await this.walletTopUpAttempt(data);
      } catch (err) {
        if (
          err instanceof OptimisticLockVersionMismatchError &&
          attempt < MAX_OPTIMISTIC_RETRIES
        ) {
          this.logger.warn(
            `Optimistic lock conflict on wallet top-up for user ${data.userId} (attempt ${attempt}), retrying`,
          );
          continue;
        }
        throw err;
      }
    }
    throw AppException.internalServerError('WALLET_TOPUP_CONFLICT');
  }

  @Transactional()
  private async walletTopUpAttempt(data: WalletTopUpDTO): Promise<Wallet> {
    const user = await this.userService.getUserById(data.userId);
    if (!user) {
      throw AppException.badRequest('USER_NOT_FOUND');
    }

    const existingTransaction =
      await this.walletTransactionService.checkIdemPotencyKey(data.id);

    if (existingTransaction) {
      return existingTransaction.wallet;
    }

    let wallet = await this.walletRepo.findByUserIdAndCurrency(
      data.userId,
      Mapper.countryToCurrencyMap(data.country),
    );

    //data.amount is already in cents
    const amountToAdd = BigInt(data.amount);

    if (!wallet) {
      wallet = new Wallet();
      wallet.user = user;
      wallet.currency = Mapper.countryToCurrencyMap(data.country);
      wallet.balance = amountToAdd.toString();
      wallet = await this.walletRepo.save(wallet);
    } else {
      const currentBalance = BigInt(wallet.balance);
      wallet.balance = (currentBalance + amountToAdd).toString();
      // throw if version mismatch (optimistic lock)
      wallet = await this.walletRepo.save(wallet);
    }

    const payload: CreateWalletTransactionDTO = {
      direction: WalletTxnDirection.CREDIT,
      historyType: WalletHistoryType.TOP_UP,
      amount: amountToAdd.toString(),
      balanceAfter: wallet.balance,
      idempotentId: data.id,
    };

    await this.walletTransactionService.createTransaction(payload, wallet);
    return wallet;
  }

  public async updateBalance(data: WalletUpdateBalanceDTO): Promise<Wallet> {
    for (let attempt = 1; attempt <= MAX_OPTIMISTIC_RETRIES; attempt++) {
      try {
        return await this.updateBalanceAttempt(data);
      } catch (err) {
        if (
          err instanceof OptimisticLockVersionMismatchError &&
          attempt < MAX_OPTIMISTIC_RETRIES
        ) {
          this.logger.warn(
            `Optimistic lock conflict updating wallet ${data.walletId} (attempt ${attempt}), retrying`,
          );
          continue;
        }
        throw err;
      }
    }
    throw AppException.internalServerError('WALLET_UPDATE_CONFLICT');
  }

  @Transactional()
  private async updateBalanceAttempt(
    data: WalletUpdateBalanceDTO,
  ): Promise<Wallet> {
    // Check idempotency first to prevent duplicate transactions
    const existingTransaction =
      await this.walletTransactionService.checkIdemPotencyKey(
        data.idempotencyKey,
      );

    if (existingTransaction) {
      this.logger.log(`Idempotent transaction found: ${data.idempotencyKey}`);
      return existingTransaction.wallet;
    }

    const wallet = await this.walletRepo.findById(data.walletId);

    if (!wallet) {
      throw AppException.notFound('WALLET_NOT_FOUND');
    }

    const currentBalance = new Decimal(wallet.balance);
    const amount = new Decimal(data.amount);

    if (
      data.direction !== WalletTxnDirection.DEBIT &&
      data.direction !== WalletTxnDirection.CREDIT
    ) {
      throw AppException.badRequest('INVALID_TRANSACTION_DIRECTION');
    }

    if (
      data.direction === WalletTxnDirection.DEBIT &&
      currentBalance.lessThan(amount)
    ) {
      throw AppException.badRequest('INSUFFICIENT_WALLET_BALANCE');
    }

    const newBalance =
      data.direction === WalletTxnDirection.DEBIT
        ? currentBalance.minus(amount)
        : currentBalance.plus(amount);

    wallet.balance = newBalance.toString();
    // Throws OptimisticLockVersionMismatchError if another transaction
    // updated this wallet since it was read above — caught by
    // updateBalance's retry loop, which re-reads and re-applies.
    await this.walletRepo.save(wallet);

    const transactionPayload: CreateWalletTransactionDTO = {
      direction: data.direction,
      historyType: data.historyType,
      amount: data.amount,
      balanceAfter: wallet.balance,
      idempotentId: data.idempotencyKey,
    };

    await this.walletTransactionService.createTransaction(
      transactionPayload,
      wallet,
    );

    this.logger.log(
      `✅ Wallet ${data.walletId} balance updated: ${currentBalance.toString()} -> ${newBalance.toString()} (${data.direction})`,
    );

    return wallet;
  }
}
