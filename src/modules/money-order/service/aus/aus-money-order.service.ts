import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import type { ReceiverContract } from '@/src/modules/receiver/contract/receiver.contract';
import { RECEIVER_SERVICE } from '@/src/modules/receiver/receiver.constant';
import type { SystemConfigContract } from '@/src/modules/system-config/contract/system-config.contract';
import { SYSTEM_CONFIG_SERVICE } from '@/src/modules/system-config/system-config.constant';
import type { UserContract } from '@/src/modules/user/contract/user.contract';
import { USER_SERVICE } from '@/src/modules/user/user.constant';
import { Inject, Injectable } from '@nestjs/common';
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
    console.log("🚀 ~ AusMoneyOrderService ~ screenReceiver ~ moneyOrderId:", moneyOrderId)
    // const moneyOrder = await this.moneyOrderRepo.findOne({
    //   where: { id: moneyOrderId },
    //   relations: ['receiver'],
    // });

    // if (!moneyOrder) {
    //   throw AppException.notFound('MONEY_ORDER_NOT_FOUND');
    // }
    await new Promise((resolve) => setTimeout(resolve, 100));
    return true;
  }
}
