import { LedgerReconciliationBreakType } from '@/src/common/enum/ledger.enum';
import { Injectable } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, Repository } from 'typeorm';
import type { LedgerReconciliationRepoContract } from '../contract/ledger-reconciliation.repo.contract';
import type {
  LedgerReconciliationBreak,
  LedgerReconciliationReport,
} from '../dto/ledger-reconciliation.dto';
import { LedgerReconciliation } from '../entity/ledger-reconciliation.entity';

const SIGNED_ENTRY_AMOUNT = `
  CASE WHEN (e.side = 'DEBIT') = (a.type IN ('ASSET', 'EXPENSE'))
       THEN e.amount ELSE -e.amount END`;

const SIGNED_ACCOUNT_BALANCE = `
  CASE WHEN a.type IN ('ASSET', 'EXPENSE') THEN a.balance ELSE -a.balance END`;

@Injectable()
export class LedgerReconciliationRepo implements LedgerReconciliationRepoContract {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    @InjectRepository(LedgerReconciliation)
    private readonly reconciliationRepo: Repository<LedgerReconciliation>,
  ) {}

  public async runChecks(): Promise<LedgerReconciliationReport> {
    return await this.dataSource.transaction('REPEATABLE READ', (manager) =>
      this.collect(manager),
    );
  }

  public async saveRun(
    run: Partial<LedgerReconciliation>,
  ): Promise<LedgerReconciliation> {
    return await this.reconciliationRepo.save(
      this.reconciliationRepo.create(run),
    );
  }

  private async collect(
    manager: EntityManager,
  ): Promise<LedgerReconciliationReport> {
    await manager.query('SET TRANSACTION READ ONLY');

    const [counts] = await manager.query<
      { accounts: number; journals: number; pending: number }[]
    >(`
      SELECT
        (SELECT COUNT(*) FROM ledger_account)::int AS accounts,
        (SELECT COUNT(*) FROM ledger_journal)::int AS journals,
        (SELECT COUNT(*)
           FROM wallet w
          WHERE w.deleted_at IS NULL
            AND w.balance <> 0
            AND NOT EXISTS (
              SELECT 1 FROM ledger_account a WHERE a.wallet_id = w.id
            ))::int AS pending
    `);

    const accountMismatches = await manager.query<
      { code: string; balance: string; derived: string }[]
    >(`
      SELECT a.code,
             a.balance::text AS balance,
             COALESCE(SUM(${SIGNED_ENTRY_AMOUNT}), 0)::text AS derived
        FROM ledger_account a
        LEFT JOIN ledger_entry e ON e.account_id = a.id
       GROUP BY a.id
      HAVING a.balance <> COALESCE(SUM(${SIGNED_ENTRY_AMOUNT}), 0)
    `);

    const walletMismatches = await manager.query<
      { code: string; ledger: string; wallet: string }[]
    >(`
      SELECT a.code,
             a.balance::text AS ledger,
             w.balance::text AS wallet
        FROM ledger_account a
        JOIN wallet w ON w.id = a.wallet_id
       WHERE a.balance <> w.balance
    `);

    const unbalancedJournals = await manager.query<
      { journalId: string; currency: string; net: string }[]
    >(`
      SELECT e.journal_id AS "journalId",
             e.currency::text AS currency,
             SUM(CASE WHEN e.side = 'DEBIT' THEN e.amount ELSE -e.amount END)::text AS net
        FROM ledger_entry e
       GROUP BY e.journal_id, e.currency
      HAVING SUM(CASE WHEN e.side = 'DEBIT' THEN e.amount ELSE -e.amount END) <> 0
    `);

    const trialBalance = await manager.query<
      { currency: string; net: string }[]
    >(`
      SELECT a.currency::text AS currency,
             SUM(${SIGNED_ACCOUNT_BALANCE})::text AS net
        FROM ledger_account a
       GROUP BY a.currency
      HAVING SUM(${SIGNED_ACCOUNT_BALANCE}) <> 0
    `);

    const breaks: LedgerReconciliationBreak[] = [
      ...accountMismatches.map((row) => ({
        type: LedgerReconciliationBreakType.ACCOUNT_BALANCE_MISMATCH,
        subject: row.code,
        expected: row.derived,
        actual: row.balance,
      })),
      ...walletMismatches.map((row) => ({
        type: LedgerReconciliationBreakType.WALLET_BALANCE_MISMATCH,
        subject: row.code,
        expected: row.ledger,
        actual: row.wallet,
      })),
      ...unbalancedJournals.map((row) => ({
        type: LedgerReconciliationBreakType.UNBALANCED_JOURNAL,
        subject: `${row.journalId} (${row.currency})`,
        expected: '0',
        actual: row.net,
      })),
      ...trialBalance.map((row) => ({
        type: LedgerReconciliationBreakType.TRIAL_BALANCE_NOT_ZERO,
        subject: row.currency,
        expected: '0',
        actual: row.net,
      })),
    ];

    return {
      accountsChecked: counts.accounts,
      journalsChecked: counts.journals,
      walletsPendingOpening: counts.pending,
      breaks,
    };
  }
}
