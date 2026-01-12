import { MoneyOrderStatus } from '@/src/common/enum/money-order-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import type { ReceiverContract } from '@/src/modules/receiver/contract/receiver.contract';
import { RECEIVER_SERVICE } from '@/src/modules/receiver/receiver.constant';
import type { SystemConfigContract } from '@/src/modules/system-config/contract/system-config.contract';
import { SYSTEM_CONFIG_SERVICE } from '@/src/modules/system-config/system-config.constant';
import type { UserContract } from '@/src/modules/user/contract/user.contract';
import { USER_SERVICE } from '@/src/modules/user/user.constant';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MoneyOrderContract } from '../../contract/money-order.contract';
import { CreateMoneyOrderDTO } from '../../dto/create-money-order.dto';
import { MoneyOrder } from '../../entity/money-order.entity';

@Injectable()
export class AusMoneyOrderService implements MoneyOrderContract {
  constructor(
    @InjectRepository(MoneyOrder)
    private readonly moneyOrderRepo: Repository<MoneyOrder>,

    @Inject(USER_SERVICE)
    private readonly userService: UserContract,

    @Inject(RECEIVER_SERVICE)
    private readonly receiverService: ReceiverContract,

    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: SystemConfigContract,
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

    const exchangeRate = BigInt(data.exchangeRate);

    if (exchangeRate !== BigInt(systemConfig.exchangeRate)) {
      throw AppException.badRequest('INVALID_EXCHANGE_RATE_PROVIDED');
    }

    const sendingAmount = BigInt(data.sendingAmount);
    const receiverAmount = BigInt(data.receiverAmount);

    // 🔴 CORE VALIDATION
    const calculatedReceiverAmount = sendingAmount * exchangeRate;

    if (calculatedReceiverAmount !== receiverAmount) {
      throw AppException.badRequest('INVALID_RECEIVER_AMOUNT');
    }

    const moneyOrder = new MoneyOrder();
    moneyOrder.sendingAmount = sendingAmount.toString();
    moneyOrder.receiverAmount = receiverAmount.toString();
    moneyOrder.promiseExchangeRate = exchangeRate.toString();

    moneyOrder.user = await this.userService.getUserById(data.userId);
    moneyOrder.receiver = await this.receiverService.getReceiverByIdAndUserId(
      data.receiverId,
      data.userId,
    );

    await this.moneyOrderRepo.save(moneyOrder);
    return moneyOrder;
  }

  public async screenReceiver(moneyOrderId: string): Promise<boolean> {
    Logger.log('========================================');
    Logger.log('🔍 ACTIVITY: screenReceiver');
    Logger.log('   Money Order ID:', moneyOrderId);
    Logger.log('========================================');

    const moneyOrder = await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.receiver', 'receiver')
      .where('moneyOrder.id = :moneyOrderId', { moneyOrderId })
      .getOne();

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

    const moneyOrder = await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('moneyOrder.id = :moneyOrderId', { moneyOrderId })
      .getOne();

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

    const moneyOrder = await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .setLock('pessimistic_write')
      .where('moneyOrder.id = :moneyOrderId', { moneyOrderId })
      .getOne();

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    const walletBalance = new Decimal(moneyOrder.user.wallet.balance);
    const sendingAmount = new Decimal(moneyOrder.sendingAmount);

    if (!walletBalance.greaterThanOrEqualTo(sendingAmount)) {
      throw AppException.badRequest('INSUFFICIENT_WALLET_BALANCE');
    }

    // Deduct sending amount from wallet
    const newBalance = walletBalance.minus(sendingAmount);
    moneyOrder.user.wallet.balance = newBalance.toFixed();

    moneyOrder.status = MoneyOrderStatus.COMPLETED;
    moneyOrder.metadata = {
      ...(moneyOrder.metadata ?? {}),
      fundsTransferredAt: `Funds transferred - ${new Date().toISOString()}`,
    };

    await this.moneyOrderRepo.save(moneyOrder);
    Logger.log(
      `✅ Transferred ${sendingAmount.toFixed()} cents. New wallet balance: ${newBalance.toFixed()} cents`,
    );

    return true;
  }
}
