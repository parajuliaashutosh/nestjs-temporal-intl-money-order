import { Inject, Injectable } from '@nestjs/common';
import type { MoneyOrderRepoContract } from '../../money-order/contract/money-order.repo.contract';
import { MONEY_ORDER_REPO } from '../../money-order/money-order.constant';
import { PayoutContract } from '../contract/payout.contract';
import type { PayoutRepoContract } from '../contract/payout.repo.contract';
import { PAYOUT_REPO } from '../payout.constant';

@Injectable()
export class PayoutService implements PayoutContract {
  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,

    @Inject(PAYOUT_REPO)
    private readonly payoutRepo: PayoutRepoContract,
  ) {}

  // dummy api call to other service like connect ips to send money to local users
  async startPayout(
    moneyOrderId: string,
  ): Promise<{ success: boolean; data: Record<string, any> }> {
    const res = await this.moneyOrderRepo.findById(moneyOrderId);
    const receiver = res.receiver;
    const req: Record<string, any> = {
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

    // persist a payout request record (mark as initial attempt)
    let payoutRecord = await this.payoutRepo.findByMoneyOrderId(res.id);

    if (!payoutRecord)
      payoutRecord = await this.payoutRepo.create({
        moneyOrderId: res.id,
        request: req,
        retryCount: 0,
      });

    try {
      const apiResp = await this.payout({ req });
      // update payout with response
      await this.payoutRepo.update(payoutRecord.id, { response: apiResp });

      return { success: true, data: { moneyOrderId } };
    } catch (err) {
      // increment retry count when we record the failure
      const newRetry = (payoutRecord.retryCount ?? 0) + 1;

      const errResponseWithTime = 'errResponse' + Date.now();

      const errResponse = {
        ...(payoutRecord.errResponses ?? {}),
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        [errResponseWithTime]: err,
      } as Record<string, any>;

      await this.payoutRepo.update(payoutRecord.id, {
        errResponses: errResponse,
        retryCount: newRetry,
      });
      throw err;
    }
  }

  // This is dummy api call to simulate something like connect ips or other payout service. It randomly fails or succeeds to help test the retry mechanism in the workflow
  async payout(request: Record<string, any>) {
    return await new Promise<Record<string, any>>((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() < 0.5; // 50% chance

        if (isSuccess) {
          console.log('Dummy API call SUCCESS:', request);
          resolve({ success: true, data: request });
        } else {
          console.log('Dummy API call FAILED:', request);
          reject(new Error('Dummy API failure'));
        }
      }, 1000);
    });
  }
}
