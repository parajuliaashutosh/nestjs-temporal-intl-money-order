import { Inject, Injectable } from '@nestjs/common';
import type { MoneyOrderRepoContract } from '../../money-order/contract/money-order.repo.contract';
import { MONEY_ORDER_REPO } from '../../money-order/money-order.constant';
import type { ReceiverRepoContract } from '../../receiver/contract/receiver.repo.contract';
import { RECEIVER_REPO } from '../../receiver/receiver.constant';
import type { PayoutRepoContract } from '../contract/payout.repo.contract';
import { PAYOUT_REPO } from '../payout.constant';

@Injectable()
export class PayoutService {
  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,

    @Inject(RECEIVER_REPO)
    private readonly receiverRepo: ReceiverRepoContract,
    @Inject(PAYOUT_REPO)
    private readonly payoutRepo: PayoutRepoContract,
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

    // persist a payout request record (mark as initial attempt)
    const payoutRecord = await this.payoutRepo.create({
      moneyOrderId: res.id,
      request: req,
      kind: 'initial',
      retryCount: 0,
    });

    try {
      const apiResp = await this.dummyApiCall({ req });
      // update payout with response
      await this.payoutRepo.update(payoutRecord.id, { response: apiResp });

      return { success: true, data: { moneyOrderId } };
    } catch (err) {
      // store error response and rethrow
      const errorMessage = (err as Error)?.message ?? String(err);
      // increment retry count when we record the failure
      const newRetry = (payoutRecord.retryCount ?? 0) + 1;
      await this.payoutRepo.update(payoutRecord.id, {
        response: { success: false, error: errorMessage },
        retryCount: newRetry,
        kind: newRetry > 0 ? 'retry' : payoutRecord.kind,
      });
      throw err;
    }
  }

  // This is dummy api call to simulate something like connect ips or any other payout service. It randomly fails or succeeds to help test the retry mechanism in the workflow
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
