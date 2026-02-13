import {
  WalletHistoryType,
  WalletTxnDirection,
} from '@/src/common/enum/wallet.enum';

export class WalletUpdateBalanceDTO {
  /** Wallet ID to update */
  walletId: string;

  /** Amount in cents (smallest currency unit) - always positive */
  amount: string;

  /** Direction: CREDIT to add, DEBIT to subtract */
  direction: WalletTxnDirection;

  /** Type of transaction for history */
  historyType: WalletHistoryType;

  /** Idempotency key to prevent duplicate transactions (e.g., moneyOrderId) */
  idempotencyKey: string;
}
