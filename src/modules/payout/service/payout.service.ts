import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import {
  LedgerEntrySide,
  LedgerJournalType,
  LedgerSystemAccount,
} from '@/src/common/enum/ledger.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LedgerContract } from '../../ledger/contract/ledger.contract';
import {
  LEDGER_IDEMPOTENCY_KEYS,
  LEDGER_SERVICE,
} from '../../ledger/ledger.constant';
import type { MoneyOrderRepoContract } from '../../money-order/contract/money-order.repo.contract';
import { MONEY_ORDER_REPO } from '../../money-order/money-order.constant';
import {
  MoneyOrderEvent,
  MoneyOrderStateMachine,
} from '../../money-order/state/money-order.state-machine';
import { PayoutContract } from '../contract/payout.contract';
import type { PayoutRepoContract } from '../contract/payout.repo.contract';
import { PAYOUT_REPO } from '../payout.constant';

@Injectable()
export class PayoutService implements PayoutContract {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    @Inject(MONEY_ORDER_REPO)
    private readonly moneyOrderRepo: MoneyOrderRepoContract,

    @Inject(PAYOUT_REPO)
    private readonly payoutRepo: PayoutRepoContract,

    @Inject(LEDGER_SERVICE)
    private readonly ledgerService: LedgerContract,
  ) {}

  // dummy api call to other service like connect ips to send money to local users
  async startPayout(
    moneyOrderId: string,
  ): Promise<{ success: boolean; data: Record<string, any> }> {
    const res = await this.moneyOrderRepo.findById(moneyOrderId);
    if (!res) throw AppException.notFound('MONEY_ORDER_NOT_FOUND');

    if (!MoneyOrderStateMachine.can(res, MoneyOrderEvent.PAYOUT_INITIATED)) {
      this.logger.warn(
        `Not paying out money order ${moneyOrderId}: status is ${res.status}/${res.deliveryStatus}`,
      );
      return { success: false, data: { moneyOrderId, status: res.status } };
    }

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

    if (!payoutRecord) {
      payoutRecord = await this.payoutRepo.create({
        moneyOrderId: res.id,
        request: req,
        retryCount: 0,
      });
    }

    if (MoneyOrderStateMachine.apply(res, MoneyOrderEvent.PAYOUT_INITIATED)) {
      await this.moneyOrderRepo.update(res.id, {
        status: res.status,
        deliveryStatus: res.deliveryStatus,
      });
    }

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

  @Transactional()
  async completeMoneyOrder(moneyOrderId: string): Promise<boolean> {
    const moneyOrder = await this.moneyOrderRepo.findById(moneyOrderId);
    if (!moneyOrder) throw AppException.notFound('MONEY_ORDER_NOT_FOUND');

    if (
      !MoneyOrderStateMachine.can(moneyOrder, MoneyOrderEvent.PAYOUT_SUCCEEDED)
    ) {
      this.logger.warn(
        `Not completing money order ${moneyOrderId}: status is ${moneyOrder.status}/${moneyOrder.deliveryStatus}`,
      );
      return false;
    }

    if (
      !MoneyOrderStateMachine.apply(
        moneyOrder,
        MoneyOrderEvent.PAYOUT_SUCCEEDED,
      )
    ) {
      return true;
    }

    await this.settleRemittance(
      moneyOrderId,
      moneyOrder.sendingAmount,
      moneyOrder.user.wallet.currency,
    );

    await this.moneyOrderRepo.update(moneyOrderId, {
      status: moneyOrder.status,
      deliveryStatus: moneyOrder.deliveryStatus,
      metadata: {
        ...(moneyOrder.metadata ?? {}),
        completedAt: `Payout completed - ${new Date().toISOString()}`,
      },
    });

    return true;
  }

  private async settleRemittance(
    moneyOrderId: string,
    amount: string,
    currency: SupportedCurrency,
  ): Promise<void> {
    const funded = await this.ledgerService.hasJournal(
      LEDGER_IDEMPOTENCY_KEYS.moneyOrderFunding(moneyOrderId),
    );
    if (!funded) {
      this.logger.warn(
        `Money order ${moneyOrderId} was funded before the ledger existed, skipping payout journal`,
      );
      return;
    }

    const payable = await this.ledgerService.getSystemAccount(
      LedgerSystemAccount.REMITTANCE_PAYABLE,
      currency,
    );
    const partner = await this.ledgerService.getSystemAccount(
      LedgerSystemAccount.PAYOUT_PARTNER_PAYABLE,
      currency,
    );

    await this.ledgerService.post({
      type: LedgerJournalType.MONEY_ORDER_PAYOUT,
      idempotencyKey: LEDGER_IDEMPOTENCY_KEYS.moneyOrderPayout(moneyOrderId),
      reference: moneyOrderId,
      description: 'Money order paid out to receiver',
      lines: [
        {
          account: payable,
          side: LedgerEntrySide.DEBIT,
          amount: BigInt(amount),
        },
        {
          account: partner,
          side: LedgerEntrySide.CREDIT,
          amount: BigInt(amount),
        },
      ],
    });
  }

  // This is dummy api call to simulate something like connect ips or other payout service. It randomly fails or succeeds to help test the retry mechanism in the workflow
  async payout(request: Record<string, any>) {
    return await new Promise<Record<string, any>>((resolve, reject) => {
      setTimeout(() => {
        const isSuccess = Math.random() < 0.5; // 50% chance

        if (isSuccess) {
          this.logger.log('Payout partner accepted the request');
          resolve({ success: true, data: request });
        } else {
          this.logger.warn('Payout partner rejected the request');
          reject(new Error('Dummy API failure'));
        }
      }, 1000);
    });
  }
}
