import { MoneyOrderStatus } from '@/src/common/enum/money-order-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import type { ReceiverContract } from '@/src/modules/receiver/contract/receiver.contract';
import { RECEIVER_SERVICE } from '@/src/modules/receiver/receiver.constant';
import type { SystemConfigContract } from '@/src/modules/system-config/contract/system-config.contract';
import { SYSTEM_CONFIG_SERVICE } from '@/src/modules/system-config/system-config.constant';
import type { UserContract } from '@/src/modules/user/contract/user.contract';
import { USER_SERVICE } from '@/src/modules/user/user.constant';
import { Wallet } from '@/src/modules/wallet/entity/wallet.entity';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { DataSource } from 'typeorm';
import { MoneyOrderContract } from '../../contract/money-order.contract';
import type { MoneyOrderRepoContract } from '../../contract/money-order.repo.contract';
import { CreateMoneyOrderDTO } from '../../dto/create-money-order.dto';
import { MoneyOrder } from '../../entity/money-order.entity';
import { MONEY_ORDER_REPO } from '../../money-order.constant';

@Injectable()
export class AusMoneyOrderService implements MoneyOrderContract {
  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,
    @Inject(USER_SERVICE) private readonly userService: UserContract,
    @Inject(RECEIVER_SERVICE)
    private readonly receiverService: ReceiverContract,
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: SystemConfigContract,

    private readonly dataSource: DataSource,
  ) {}

  public async createMoneyOrder(
    data: CreateMoneyOrderDTO,
  ): Promise<MoneyOrder> {
    const systemConfig = await this.systemConfigService.getSystemConfigByKey(
      SupportedCountry.AUS,
    );

    if (!systemConfig) {
      throw AppException.badRequest('SYSTEM_CONFIG_NOT_FOUND_FOR_AUS');
    }

    const exchangeRate = new Decimal(data.exchangeRate);
    const systemExchangeRate = new Decimal(systemConfig.exchangeRate);

    if (!exchangeRate.equals(systemExchangeRate)) {
      throw AppException.badRequest('INVALID_EXCHANGE_RATE_PROVIDED');
    }

    const sendingAmount = new Decimal(data.sendingAmount);
    const receiverAmount = new Decimal(data.receiverAmount);

    // 🔴 CORE VALIDATION
    const calculatedReceiverAmount = sendingAmount.times(exchangeRate);

    if (!calculatedReceiverAmount.equals(receiverAmount)) {
      throw AppException.badRequest('INVALID_RECEIVER_AMOUNT');
    }

    const user = await this.userService.getUserById(data.userId);
    if (!user) {
      throw AppException.badRequest('USER_NOT_FOUND');
    }

    const receiver = await this.receiverService.getReceiverByIdAndUserId(
      data.receiverId,
      data.userId,
    );
    if (!receiver) {
      throw AppException.badRequest('RECEIVER_NOT_FOUND_FOR_USER');
    }

    const moneyOrder = new MoneyOrder();
    moneyOrder.sendingAmount = sendingAmount.toFixed();
    moneyOrder.receiverAmount = receiverAmount.toFixed();
    moneyOrder.promiseExchangeRate = exchangeRate.toFixed();
    moneyOrder.user = user;
    moneyOrder.receiver = receiver;
    await this.moneyOrderRepo.save(moneyOrder);

    return moneyOrder;
  }

  public async screenReceiver(moneyOrderId: string): Promise<boolean> {
    Logger.log('========================================');
    Logger.log('🔍 ACTIVITY: screenReceiver');
    Logger.log('   Money Order ID:', moneyOrderId);
    Logger.log('========================================');

    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    const passed = Math.random() > 0.4;
    Logger.log(`✅ Result: ${passed ? 'PASSED' : 'FAILED'}`);

    if (passed) {
      moneyOrder.metadata = {
        ...moneyOrder.metadata,
        screeningPassedAt: `Screening passed ${new Date().toISOString()}`,
      };
      await this.moneyOrderRepo.save(moneyOrder);
      return true;
    } else {
      moneyOrder.status = MoneyOrderStatus.ON_HOLD;
      moneyOrder.metadata = {
        ...(moneyOrder.metadata ?? {}),
        screeningFailureReason: `Receiver failed the screening process - ${new Date().toISOString()}`,
      };
      await this.moneyOrderRepo.save(moneyOrder);
      return false;
    }
  }

  public async checkWalletBalance(moneyOrderId: string): Promise<boolean> {
    Logger.log('========================================');
    Logger.log('💰 ACTIVITY: checkWalletBalance');
    Logger.log('========================================');

    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    const walletBalance = new Decimal(moneyOrder.user.wallet.balance);
    const sendingAmount = new Decimal(moneyOrder.sendingAmount);

    if (walletBalance.greaterThanOrEqualTo(sendingAmount)) {
      Logger.log(
        `✅ Sufficient wallet balance: ${walletBalance.toFixed()} cents`,
      );
      return true;
    } else {
      Logger.log(
        `❌ Insufficient wallet balance: ${walletBalance.toFixed()} cents`,
      );
      moneyOrder.status = MoneyOrderStatus.ON_HOLD;
      moneyOrder.metadata = {
        ...(moneyOrder.metadata ?? {}),
        insufficientWalletBalanceAt: `Insufficient wallet balance - ${new Date().toISOString()}`,
      };
      await this.moneyOrderRepo.save(moneyOrder);
      return false;
    }
  }

  public async transferFunds(moneyOrderId: string): Promise<boolean> {
    Logger.log('========================================');
    Logger.log('💸 ACTIVITY: transferFunds');
    Logger.log('========================================');

    await this.dataSource.transaction(async (manager) => {
      const moneyOrder = await manager
        .getRepository(MoneyOrder)
        .createQueryBuilder('moneyOrder')
        .leftJoinAndSelect('moneyOrder.user', 'user')
        .leftJoinAndSelect('user.wallet', 'wallet')
        .where('moneyOrder.id = :moneyOrderId', { moneyOrderId })
        .setLock('pessimistic_write')
        .getOne();

      if (!moneyOrder) {
        throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
      }

      const wallet = moneyOrder.user.wallet;

      // Explicitly lock the wallet row
      await manager
        .getRepository(Wallet)
        .createQueryBuilder('wallet')
        .where('wallet.id = :id', { id: wallet.id })
        .setLock('pessimistic_write')
        .getOne();

      const walletBalance = new Decimal(wallet.balance);
      const sendingAmount = new Decimal(moneyOrder.sendingAmount);

      if (!walletBalance.greaterThanOrEqualTo(sendingAmount)) {
        throw AppException.badRequest('INSUFFICIENT_WALLET_BALANCE');
      }

      wallet.balance = walletBalance.minus(sendingAmount).toFixed();
      moneyOrder.status = MoneyOrderStatus.COMPLETED;

      await manager.save([wallet, moneyOrder]);
    });

    return true;
  }
}
