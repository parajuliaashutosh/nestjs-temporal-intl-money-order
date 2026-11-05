import Base from '@/src/common/entity/base.entity';
import { LedgerAccountType } from '@/src/common/enum/ledger.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import {
  Check,
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  VersionColumn,
} from 'typeorm';
import { Wallet } from '../../wallet/entity/wallet.entity';

@Entity('ledger_account')
@Check(`"allow_negative" OR "balance" >= 0`)
export class LedgerAccount extends Base {
  @Column({ unique: true })
  code: string;

  @Column({ type: 'enum', enum: LedgerAccountType })
  type: LedgerAccountType;

  @Column({ type: 'enum', enum: SupportedCurrency })
  currency: SupportedCurrency;

  // storing in cents to avoid floating point issues
  @Column({ type: 'bigint', default: '0' })
  balance: string;

  @Column({ name: 'allow_negative', default: false })
  allowNegative: boolean;

  @Column({ name: 'wallet_id', nullable: true })
  walletId: string | null;

  @OneToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'wallet_id' })
  wallet?: Wallet;

  @VersionColumn()
  version: number;
}
