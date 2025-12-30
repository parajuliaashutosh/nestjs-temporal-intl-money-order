import Base from "@/src/common/entity/base.entity";
import { WalletHistoryType, WalletTxnDirection } from "@/src/common/enum/wallet.enum";
import { Column, Entity, ManyToOne } from "typeorm";
import { Wallet } from "./wallet.entity";


@Entity('wallet_transaction')
export class WalletTransaction extends Base {
  @Column({ type: 'enum', enum: WalletTxnDirection })
  direction: WalletTxnDirection;

  @Column({ type: 'enum', enum: WalletHistoryType })
  historyType: WalletHistoryType;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  amount: string;

  @Column({
    type: 'decimal',
    precision: 18,
    scale: 2,
  })
  balanceAfter: string; // snapshot after txn ✅

  // to maintain idempotency for different txn sources
  @Column({ nullable: true })
  idemPotent?: string; // orderId, payoutId, adminId, or webhook id

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  wallet: Wallet;
}

