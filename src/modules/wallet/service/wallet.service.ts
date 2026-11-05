import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import {
  LedgerEntrySide,
  LedgerJournalType,
  LedgerSystemAccount,
} from '@/src/common/enum/ledger.enum';
import {
  WalletHistoryType,
  WalletTxnDirection,
} from '@/src/common/enum/wallet.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Mapper } from '@/src/common/util/mapper';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type { LedgerContract } from '../../ledger/contract/ledger.contract';
import {
  LEDGER_IDEMPOTENCY_KEYS,
  LEDGER_SERVICE,
} from '../../ledger/ledger.constant';
import type { UserContract } from '../../user/contract/user.contract';
import { USER_SERVICE } from '../../user/user.constant';
import type { WalletTransactionContract } from '../contract/wallet-transaction.contract';
import { WalletContract } from '../contract/wallet.contract';
import type { WalletRepoContract } from '../contract/wallet.repo.contract';
import { WalletChargeForMoneyOrderDTO } from '../dto/wallet-charge.dto';
import { WalletTopUpDTO } from '../dto/wallet-topup.dto';
import { Wallet } from '../entity/wallet.entity';
import { WALLET_REPO, WALLET_TRANSACTION_SERVICE } from '../wallet.constant';

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
    @Inject(LEDGER_SERVICE)
    private readonly ledgerService: LedgerContract,
  ) {}

  @Transactional()
  public async walletTopUp(data: WalletTopUpDTO): Promise<Wallet> {
    const user = await this.userService.getUserById(data.userId);
    if (!user) {
      throw AppException.badRequest('USER_NOT_FOUND');
    }

    if (user.country !== data.country) {
      throw AppException.badRequest('TOP_UP_COUNTRY_MISMATCH');
    }

    const legacy = await this.walletTransactionService.checkIdemPotencyKey(
      data.id,
    );
    if (legacy) return legacy.wallet;

    const currency = Mapper.countryToCurrencyMap(data.country);

    let wallet = await this.walletRepo.findByUserIdAndCurrency(
      data.userId,
      currency,
    );
    if (!wallet) {
      wallet = new Wallet();
      wallet.user = user;
      wallet.currency = currency;
      wallet.balance = '0';
      wallet = await this.walletRepo.save(wallet);
    }

    const amount = BigInt(data.amount);
    const walletAccount = await this.ledgerService.getWalletAccount(wallet);
    const clearing = await this.ledgerService.getSystemAccount(
      LedgerSystemAccount.STRIPE_CLEARING,
      currency,
    );

    const posted = await this.ledgerService.post({
      type: LedgerJournalType.WALLET_TOP_UP,
      idempotencyKey: LEDGER_IDEMPOTENCY_KEYS.walletTopUp(data.id),
      reference: data.id,
      description: 'Wallet top-up via Stripe',
      lines: [
        { account: clearing, side: LedgerEntrySide.DEBIT, amount },
        { account: walletAccount, side: LedgerEntrySide.CREDIT, amount },
      ],
    });

    if (posted.replayed) return wallet;

    return await this.syncWallet(
      wallet,
      posted.balances.get(walletAccount.id),
      {
        direction: WalletTxnDirection.CREDIT,
        historyType: WalletHistoryType.TOP_UP,
        amount: amount.toString(),
        idempotentId: data.id,
      },
    );
  }

  @Transactional()
  public async chargeForMoneyOrder(
    data: WalletChargeForMoneyOrderDTO,
  ): Promise<Wallet> {
    const legacy = await this.walletTransactionService.checkIdemPotencyKey(
      data.moneyOrderId,
    );
    if (legacy) return legacy.wallet;

    const wallet = await this.walletRepo.findById(data.walletId);
    if (!wallet) {
      throw AppException.notFound('WALLET_NOT_FOUND');
    }

    const amount = BigInt(data.amount);
    const walletAccount = await this.ledgerService.getWalletAccount(wallet);
    const payable = await this.ledgerService.getSystemAccount(
      LedgerSystemAccount.REMITTANCE_PAYABLE,
      wallet.currency,
    );

    const posted = await this.ledgerService.post({
      type: LedgerJournalType.MONEY_ORDER_FUNDING,
      idempotencyKey: LEDGER_IDEMPOTENCY_KEYS.moneyOrderFunding(
        data.moneyOrderId,
      ),
      reference: data.moneyOrderId,
      description: 'Wallet charged for money order',
      lines: [
        { account: walletAccount, side: LedgerEntrySide.DEBIT, amount },
        { account: payable, side: LedgerEntrySide.CREDIT, amount },
      ],
    });

    if (posted.replayed) return wallet;

    return await this.syncWallet(
      wallet,
      posted.balances.get(walletAccount.id),
      {
        direction: WalletTxnDirection.DEBIT,
        historyType: WalletHistoryType.ORDER_PAYMENT,
        amount: amount.toString(),
        idempotentId: data.moneyOrderId,
      },
    );
  }

  private async syncWallet(
    wallet: Wallet,
    balance: string,
    history: {
      direction: WalletTxnDirection;
      historyType: WalletHistoryType;
      amount: string;
      idempotentId: string;
    },
  ): Promise<Wallet> {
    const updated = await this.walletRepo.update(wallet.id, { balance });

    await this.walletTransactionService.createTransaction(
      { ...history, balanceAfter: balance },
      updated,
    );

    this.logger.log(
      `Wallet ${wallet.id} ${history.direction.toLowerCase()} ${history.amount}, balance now ${balance}`,
    );

    return updated;
  }
}
