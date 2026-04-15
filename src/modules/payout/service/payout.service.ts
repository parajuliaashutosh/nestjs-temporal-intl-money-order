import { Inject, Injectable } from '@nestjs/common';
import type { MoneyOrderRepoContract } from '../../money-order/contract/money-order.repo.contract';
import { MONEY_ORDER_REPO } from '../../money-order/money-order.constant';
import type { ReceiverRepoContract } from '../../receiver/contract/receiver.repo.contract';
import { RECEIVER_REPO } from '../../receiver/receiver.constant';

@Injectable()
export class PayoutService {
  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,

    @Inject(RECEIVER_REPO)
    private readonly receiverRepo: ReceiverRepoContract,
  ) {}
  // dummy api call to other service like connect ips to send money to local users
  async payout(moneyOrderId: string): Promise<{ success: boolean; data: any }> {
    const res = await this.moneyOrderRepo.findById(moneyOrderId);
    const receiver = res.receiver;
    const req = {
      idempotent: res?.idempotentId,
      // this is in paisa, cents
      amount: res?.receiverAmount,
      receiverPhone: receiver?.phoneNumber,

      receiverFirstName: receiver?.firstName,
      receiverMiddleName: receiver?.middleName,
      receiverLastName: receiver?.lastName,
      receiverAddress: receiver?.address,

      receiverBankAccountNumber: receiver?.bankAccountNumber,
      receiverBankName: receiver?.bankName,
    };

    await this.dummyApiCall({ req });

    return { success: true, data: { moneyOrderId } };
  }

  async dummyApiCall(request: any) {
    return await new Promise((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() < 0.5; // 50% chance

        if (isSuccess) {
          console.log('Dummy API call SUCCESS:', request);
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          resolve({ success: true, data: request });
        } else {
          console.log('Dummy API call FAILED:', request);
          reject(new Error('Dummy API failure'));
        }
      }, 1000);
    });
  }
}
