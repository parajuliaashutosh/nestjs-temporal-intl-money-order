import {
  LedgerAccountType,
  LedgerSystemAccount,
} from '@/src/common/enum/ledger.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';

export const LEDGER_SERVICE = Symbol('LEDGER_SERVICE');
export const LEDGER_REPO = Symbol('LEDGER_REPO');
export const LEDGER_RECONCILIATION_SERVICE = Symbol(
  'LEDGER_RECONCILIATION_SERVICE',
);
export const LEDGER_RECONCILIATION_REPO = Symbol('LEDGER_RECONCILIATION_REPO');

export const SYSTEM_ACCOUNT_TYPES: Readonly<
  Record<LedgerSystemAccount, LedgerAccountType>
> = {
  [LedgerSystemAccount.STRIPE_CLEARING]: LedgerAccountType.ASSET,
  [LedgerSystemAccount.REMITTANCE_PAYABLE]: LedgerAccountType.LIABILITY,
  [LedgerSystemAccount.PAYOUT_PARTNER_PAYABLE]: LedgerAccountType.LIABILITY,
  [LedgerSystemAccount.OPENING_BALANCE_EQUITY]: LedgerAccountType.EQUITY,
};

export const LEDGER_ACCOUNT_CODES = {
  wallet: (walletId: string) => `WALLET:${walletId}`,
  system: (account: LedgerSystemAccount, currency: SupportedCurrency) =>
    `${account}:${currency}`,
};

export const LEDGER_IDEMPOTENCY_KEYS = {
  walletOpening: (walletId: string) => `wallet-opening:${walletId}`,
  walletTopUp: (sourceId: string) => `wallet-top-up:${sourceId}`,
  moneyOrderFunding: (moneyOrderId: string) =>
    `money-order-funding:${moneyOrderId}`,
  moneyOrderPayout: (moneyOrderId: string) =>
    `money-order-payout:${moneyOrderId}`,
};
