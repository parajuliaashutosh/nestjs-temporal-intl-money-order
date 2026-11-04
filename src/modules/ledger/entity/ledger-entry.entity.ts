import { LedgerEntrySide } from '@/src/common/enum/ledger.enum';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import {
  Check,
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LedgerAccount } from './ledger-account.entity';
import { LedgerJournal } from './ledger-journal.entity';

@Entity('ledger_entry')
@Index(['account', 'createdAt'])
@Check(`"amount" > 0`)
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @ManyToOne(() => LedgerJournal, (journal) => journal.entries, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'journal_id' })
  journal: LedgerJournal;

  @ManyToOne(() => LedgerAccount, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'account_id' })
  account: LedgerAccount;

  @Column({ type: 'enum', enum: LedgerEntrySide })
  side: LedgerEntrySide;

  // storing in cents to avoid floating point issues
  @Column({ type: 'bigint' })
  amount: string;

  @Column({ type: 'enum', enum: SupportedCurrency })
  currency: SupportedCurrency;

  @Column({ name: 'balance_after', type: 'bigint' })
  balanceAfter: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
