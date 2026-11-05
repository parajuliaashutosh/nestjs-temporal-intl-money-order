import { LedgerJournalType } from '@/src/common/enum/ledger.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { LedgerEntry } from './ledger-entry.entity';

@Entity('ledger_journal')
export class LedgerJournal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'enum', enum: LedgerJournalType })
  type: LedgerJournalType;

  @Column({ name: 'idempotency_key', unique: true })
  idempotencyKey: string;

  @Index()
  @Column({ nullable: true })
  reference: string | null;

  @Column({ nullable: true })
  description: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown> | null;

  @OneToMany(() => LedgerEntry, (entry) => entry.journal, {
    cascade: ['insert'],
  })
  entries: LedgerEntry[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
