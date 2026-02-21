import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import {
  WalletHistoryType,
  WalletTxnDirection,
} from '@/src/common/enum/wallet.enum';
import { AppException } from '@/src/common/exception/app.exception';
import type { ReceiverContract } from '@/src/modules/receiver/contract/receiver.contract';
import { RECEIVER_SERVICE } from '@/src/modules/receiver/receiver.constant';
import type { SystemConfigContract } from '@/src/modules/system-config/contract/system-config.contract';
import { SYSTEM_CONFIG_SERVICE } from '@/src/modules/system-config/system-config.constant';
import type { UserContract } from '@/src/modules/user/contract/user.contract';
import { USER_SERVICE } from '@/src/modules/user/user.constant';
import type { WalletContract } from '@/src/modules/wallet/contract/wallet.contract';
import { WalletUpdateBalanceDTO } from '@/src/modules/wallet/dto/wallet-update-balance.dto';
import { WALLET_SERVICE } from '@/src/modules/wallet/wallet.constant';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { MoneyOrderContract } from '../../contract/money-order.contract';
import type { MoneyOrderRepoContract } from '../../contract/money-order.repo.contract';
import { CreateMoneyOrderDTO } from '../../dto/create-money-order.dto';
import { MoneyOrder } from '../../entity/money-order.entity';
import { MONEY_ORDER_REPO } from '../../money-order.constant';

@Injectable()
export class UsaMoneyOrderService implements MoneyOrderContract {
  private readonly log = new Logger(UsaMoneyOrderService.name);
  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,

    @Inject(USER_SERVICE)
    private readonly userService: UserContract,

    @Inject(RECEIVER_SERVICE)
    private readonly receiverService: ReceiverContract,

    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: SystemConfigContract,

    @Inject(WALLET_SERVICE)
    private readonly walletService: WalletContract,
  ) {}

  public async createMoneyOrder(
    data: CreateMoneyOrderDTO,
  ): Promise<MoneyOrder> {
    const systemConfig = await this.systemConfigService.getSystemConfigByKey(
      SupportedCountry.USA,
    );

    if (!systemConfig) {
      throw AppException.badRequest('SYSTEM_CONFIG_NOT_FOUND_FOR_USA');
    }

    // ✅ Use Decimal for precise decimal arithmetic
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

    // ✅ Save amounts as strings to avoid JS floating point issues
    const moneyOrder = new MoneyOrder();
    moneyOrder.sendingAmount = sendingAmount.toFixed(); // string
    moneyOrder.receiverAmount = receiverAmount.toFixed();
    moneyOrder.promiseExchangeRate = exchangeRate.toFixed();

    moneyOrder.status = MoneyOrderStatus.INITIATED;
    moneyOrder.deliveryStatus =
      MoneyOrderDeliveryStatus.DELIVERY_NOT_AUTHORIZED;

    moneyOrder.user = await this.userService.getUserById(data.userId);
    moneyOrder.receiver = await this.receiverService.getReceiverByIdAndUserId(
      data.receiverId,
      data.userId,
    );

    return await this.moneyOrderRepo.save(moneyOrder);
  }

  public async screenReceiver(moneyOrderId: string): Promise<boolean> {
    this.log.log('========================================');
    this.log.log('🔍 ACTIVITY: screenReceiver');
    this.log.log('   Money Order ID:', moneyOrderId);
    this.log.log('========================================');

    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    const passed = Math.random() > 0.4;
    this.log.log(`✅ Result: ${passed ? 'PASSED' : 'FAILED'}`);

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
    this.log.log('========================================');
    this.log.log('💰 ACTIVITY: checkWalletBalance');
    this.log.log('========================================');

    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    const walletBalance = new Decimal(moneyOrder.user.wallet.balance);
    const sendingAmount = new Decimal(moneyOrder.sendingAmount);

    if (walletBalance.greaterThanOrEqualTo(sendingAmount)) {
      this.log.log(
        `✅ Sufficient wallet balance: ${walletBalance.toFixed()} cents`,
      );
      return true;
    } else {
      this.log.log(
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

  @Transactional()
  public async transferFunds(moneyOrderId: string): Promise<boolean> {
    this.log.log('========================================');
    this.log.log('💸 ACTIVITY: transferFunds');
    this.log.log('========================================');

    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

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

    const payload: WalletUpdateBalanceDTO = {
      walletId: moneyOrder.user.wallet.id,
      amount: sendingAmount.toFixed(),
      direction: WalletTxnDirection.DEBIT,
      historyType: WalletHistoryType.ORDER_PAYMENT,
      idempotencyKey: moneyOrder.id,
    };
    await this.walletService.updateBalance(payload);

    return true;
  }
}
