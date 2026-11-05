import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import { AppException } from '@/src/common/exception/app.exception';
import type { ReceiverContract } from '@/src/modules/receiver/contract/receiver.contract';
import { RECEIVER_SERVICE } from '@/src/modules/receiver/receiver.constant';
import type { SystemConfigContract } from '@/src/modules/system-config/contract/system-config.contract';
import { SYSTEM_CONFIG_SERVICE } from '@/src/modules/system-config/system-config.constant';
import type { UserContract } from '@/src/modules/user/contract/user.contract';
import { USER_SERVICE } from '@/src/modules/user/user.constant';
import type { WalletContract } from '@/src/modules/wallet/contract/wallet.contract';
import { WALLET_SERVICE } from '@/src/modules/wallet/wallet.constant';
import { Inject, Injectable, Logger } from '@nestjs/common';
import Decimal from 'decimal.js';
import { MoneyOrderContract } from '../../contract/money-order.contract';
import type { MoneyOrderRepoContract } from '../../contract/money-order.repo.contract';
import { CreateMoneyOrderDTO } from '../../dto/create-money-order.dto';
import { MoneyOrder } from '../../entity/money-order.entity';
import { MONEY_ORDER_REPO } from '../../money-order.constant';
import {
  MoneyOrderEvent,
  MoneyOrderStateMachine,
} from '../../state/money-order.state-machine';

@Injectable()
export class AusMoneyOrderService implements MoneyOrderContract {
  private readonly log = new Logger(AusMoneyOrderService.name);
  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,
    @Inject(USER_SERVICE) private readonly userService: UserContract,
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
      SupportedCountry.AUS,
    );

    if (!systemConfig) {
      throw AppException.badRequest('SYSTEM_CONFIG_NOT_FOUND_FOR_AUS');
    }

    const prevTransaction = await this.moneyOrderRepo.findByIdempotentId(
      data.idempotentId,
    );

    if (prevTransaction) {
      this.log.warn(
        `Idempotent transaction found for idempotentId ${data.idempotentId}, returning existing transaction with ID ${prevTransaction.id}`,
      );
      return prevTransaction;
    }

    const exchangeRate = new Decimal(data.exchangeRate);
    const systemExchangeRate = new Decimal(systemConfig.exchangeRate);

    if (!exchangeRate.equals(systemExchangeRate)) {
      throw AppException.badRequest('INVALID_EXCHANGE_RATE_PROVIDED');
    }

    const sendingAmount = new Decimal(data.sendingAmount);
    const receiverAmount = new Decimal(data.receiverAmount);

    // CORE VALIDATION
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
    moneyOrder.idempotentId = data.idempotentId;
    Object.assign(moneyOrder, MoneyOrderStateMachine.initial());

    return await this.moneyOrderRepo.saveIdempotently(moneyOrder);
  }

  public async screenReceiver(moneyOrderId: string): Promise<boolean> {
    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    const passed = Math.random() > 0.4;
    Logger.log(
      `Screening for money order ${moneyOrderId} ${passed ? 'passed' : 'failed'}`,
    );

    if (passed) {
      moneyOrder.metadata = {
        ...moneyOrder.metadata,
        screeningPassedAt: `Screening passed ${new Date().toISOString()}`,
      };
      await this.moneyOrderRepo.save(moneyOrder);
      return true;
    } else {
      MoneyOrderStateMachine.apply(
        moneyOrder,
        MoneyOrderEvent.SCREENING_FAILED,
      );
      moneyOrder.metadata = {
        ...(moneyOrder.metadata ?? {}),
        screeningFailureReason: `Receiver failed the screening process - ${new Date().toISOString()}`,
      };
      await this.moneyOrderRepo.save(moneyOrder);
      return false;
    }
  }

  public async checkWalletBalance(moneyOrderId: string): Promise<boolean> {
    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    const walletBalance = new Decimal(moneyOrder.user.wallet.balance);
    const sendingAmount = new Decimal(moneyOrder.sendingAmount);

    if (walletBalance.greaterThanOrEqualTo(sendingAmount)) {
      Logger.log(
        `Money order ${moneyOrderId}: wallet balance ${walletBalance.toFixed()} covers ${sendingAmount.toFixed()}`,
      );
      return true;
    } else {
      Logger.warn(
        `Money order ${moneyOrderId}: wallet balance ${walletBalance.toFixed()} is below ${sendingAmount.toFixed()}`,
      );
      MoneyOrderStateMachine.apply(
        moneyOrder,
        MoneyOrderEvent.INSUFFICIENT_BALANCE,
      );
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
    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);

    if (!moneyOrder) {
      throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    }

    if (
      !MoneyOrderStateMachine.can(moneyOrder, MoneyOrderEvent.FUNDS_DEBITED)
    ) {
      Logger.warn(
        `Skipping transfer for ${moneyOrderId}: status is ${moneyOrder.status}`,
      );
      return false;
    }

    try {
      await this.walletService.chargeForMoneyOrder({
        walletId: moneyOrder.user.wallet.id,
        amount: moneyOrder.sendingAmount,
        moneyOrderId: moneyOrder.id,
      });
    } catch (err) {
      if (
        err instanceof AppException &&
        err.message === 'INSUFFICIENT_WALLET_BALANCE'
      ) {
        MoneyOrderStateMachine.apply(
          moneyOrder,
          MoneyOrderEvent.INSUFFICIENT_BALANCE,
        );
        moneyOrder.metadata = {
          ...(moneyOrder.metadata ?? {}),
          insufficientWalletBalanceAt: `Insufficient wallet balance at transfer - ${new Date().toISOString()}`,
        };
        await this.moneyOrderRepo.save(moneyOrder);
        return false;
      }
      throw err;
    }

    MoneyOrderStateMachine.apply(moneyOrder, MoneyOrderEvent.FUNDS_DEBITED);
    moneyOrder.metadata = {
      ...(moneyOrder.metadata ?? {}),
      fundsTransferredAt: `Funds transferred - ${new Date().toISOString()}`,
    };
    await this.moneyOrderRepo.save(moneyOrder);

    return true;
  }
}
