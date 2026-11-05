import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import {
  LedgerAccountType,
  LedgerEntrySide,
  LedgerJournalType,
  LedgerSystemAccount,
} from '@/src/common/enum/ledger.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Inject, Injectable, Logger } from '@nestjs/common';
import type {
  LedgerContract,
  PostedJournal,
} from '../contract/ledger.contract';
import type { LedgerRepoContract } from '../contract/ledger.repo.contract';
import type { PostJournalDTO, WalletAccountRef } from '../dto/post-journal.dto';
import { LedgerAccount } from '../entity/ledger-account.entity';
import { LedgerEntry } from '../entity/ledger-entry.entity';
import { LedgerJournal } from '../entity/ledger-journal.entity';
import {
  LEDGER_ACCOUNT_CODES,
  LEDGER_IDEMPOTENCY_KEYS,
  LEDGER_REPO,
  SYSTEM_ACCOUNT_TYPES,
} from '../ledger.constant';

const DEBIT_NORMAL_TYPES = new Set([
  LedgerAccountType.ASSET,
  LedgerAccountType.EXPENSE,
]);

@Injectable()
export class LedgerService implements LedgerContract {
  private readonly logger = new Logger(LedgerService.name);

  constructor(
    @Inject(LEDGER_REPO) private readonly ledgerRepo: LedgerRepoContract,
  ) {}

  @Transactional()
  public async post(data: PostJournalDTO): Promise<PostedJournal> {
    this.validate(data);

    await this.ledgerRepo.lockIdempotencyKey(data.idempotencyKey);

    const existing = await this.ledgerRepo.findJournalByIdempotencyKey(
      data.idempotencyKey,
    );
    if (existing) {
      return {
        journal: existing,
        replayed: true,
        balances: new Map(
          existing.entries.map((entry) => [
            entry.account.id,
            entry.account.balance,
          ]),
        ),
      };
    }

    const accountIds = [...new Set(data.lines.map((l) => l.account.id))];
    const locked = await this.ledgerRepo.lockAccounts(accountIds);
    if (locked.length !== accountIds.length) {
      throw AppException.notFound('LEDGER_ACCOUNT_NOT_FOUND');
    }

    const accounts = new Map(locked.map((account) => [account.id, account]));
    const balances = new Map(
      locked.map((account) => [account.id, BigInt(account.balance)]),
    );

    const journal = new LedgerJournal();
    journal.type = data.type;
    journal.idempotencyKey = data.idempotencyKey;
    journal.reference = data.reference ?? null;
    journal.description = data.description ?? null;
    journal.metadata = data.metadata ?? null;
    journal.entries = data.lines.map((line) => {
      const account = accounts.get(line.account.id);
      const next =
        balances.get(account.id) +
        this.signedAmount(account, line.side, line.amount);
      balances.set(account.id, next);

      const entry = new LedgerEntry();
      entry.account = account;
      entry.side = line.side;
      entry.amount = line.amount.toString();
      entry.currency = account.currency;
      entry.balanceAfter = next.toString();
      return entry;
    });

    for (const [id, balance] of balances) {
      const account = accounts.get(id);
      if (balance < 0n && !account.allowNegative) {
        throw AppException.badRequest(
          account.walletId
            ? 'INSUFFICIENT_WALLET_BALANCE'
            : `LEDGER_ACCOUNT_OVERDRAWN: ${account.code}`,
        );
      }
    }

    for (const [id, balance] of balances) {
      await this.ledgerRepo.updateAccountBalance(id, balance.toString());
    }

    const saved = await this.ledgerRepo.saveJournal(journal);

    this.logger.log(
      `Posted ${data.type} journal ${saved.id} (${data.idempotencyKey})`,
    );

    return {
      journal: saved,
      replayed: false,
      balances: new Map(
        [...balances].map(([id, balance]) => [id, balance.toString()]),
      ),
    };
  }

  @Transactional()
  public async getWalletAccount(
    wallet: WalletAccountRef,
  ): Promise<LedgerAccount> {
    const code = LEDGER_ACCOUNT_CODES.wallet(wallet.id);

    const existing = await this.ledgerRepo.findAccountByCode(code);
    if (existing) return existing;

    const created = await this.ledgerRepo.insertAccountIfAbsent({
      code,
      type: LedgerAccountType.LIABILITY,
      currency: wallet.currency,
      allowNegative: false,
      walletId: wallet.id,
    });

    const account = await this.ledgerRepo.findAccountByCode(code);
    const openingBalance = BigInt(wallet.balance ?? '0');

    if (created && openingBalance > 0n) {
      const equity = await this.getSystemAccount(
        LedgerSystemAccount.OPENING_BALANCE_EQUITY,
        wallet.currency,
      );
      await this.post({
        type: LedgerJournalType.WALLET_OPENING_BALANCE,
        idempotencyKey: LEDGER_IDEMPOTENCY_KEYS.walletOpening(wallet.id),
        reference: wallet.id,
        description: 'Opening balance carried over from wallet',
        lines: [
          {
            account: equity,
            side: LedgerEntrySide.DEBIT,
            amount: openingBalance,
          },
          {
            account,
            side: LedgerEntrySide.CREDIT,
            amount: openingBalance,
          },
        ],
      });
    }

    return account;
  }

  @Transactional()
  public async getSystemAccount(
    name: LedgerSystemAccount,
    currency: SupportedCurrency,
  ): Promise<LedgerAccount> {
    const code = LEDGER_ACCOUNT_CODES.system(name, currency);

    const existing = await this.ledgerRepo.findAccountByCode(code);
    if (existing) return existing;

    await this.ledgerRepo.insertAccountIfAbsent({
      code,
      type: SYSTEM_ACCOUNT_TYPES[name],
      currency,
      allowNegative: true,
      walletId: null,
    });

    return await this.ledgerRepo.findAccountByCode(code);
  }

  public async hasJournal(idempotencyKey: string): Promise<boolean> {
    return !!(await this.ledgerRepo.findJournalByIdempotencyKey(
      idempotencyKey,
    ));
  }

  private validate(data: PostJournalDTO): void {
    if (data.lines.length < 2) {
      throw AppException.badRequest('LEDGER_JOURNAL_NEEDS_TWO_LINES');
    }

    const totals = new Map<SupportedCurrency, bigint>();

    for (const line of data.lines) {
      if (line.amount <= 0n) {
        throw AppException.badRequest('LEDGER_AMOUNT_MUST_BE_POSITIVE');
      }
      const signed =
        line.side === LedgerEntrySide.DEBIT ? line.amount : -line.amount;
      const currency = line.account.currency;
      totals.set(currency, (totals.get(currency) ?? 0n) + signed);
    }

    for (const [currency, total] of totals) {
      if (total !== 0n) {
        throw AppException.badRequest(
          `LEDGER_JOURNAL_UNBALANCED: ${currency} off by ${total.toString()}`,
        );
      }
    }
  }

  private signedAmount(
    account: LedgerAccount,
    side: LedgerEntrySide,
    amount: bigint,
  ): bigint {
    const normalSide = DEBIT_NORMAL_TYPES.has(account.type)
      ? LedgerEntrySide.DEBIT
      : LedgerEntrySide.CREDIT;
    return side === normalSide ? amount : -amount;
  }
}
