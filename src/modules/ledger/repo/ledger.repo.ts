import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import type { LedgerRepoContract } from '../contract/ledger.repo.contract';
import { LedgerAccount } from '../entity/ledger-account.entity';
import { LedgerJournal } from '../entity/ledger-journal.entity';

@Injectable()
export class LedgerRepo implements LedgerRepoContract {
  constructor(
    @InjectRepository(LedgerAccount)
    private readonly accountRepo: Repository<LedgerAccount>,
    @InjectRepository(LedgerJournal)
    private readonly journalRepo: Repository<LedgerJournal>,
  ) {}

  public async lockIdempotencyKey(key: string): Promise<void> {
    await this.journalRepo.query(
      'SELECT pg_advisory_xact_lock(hashtextextended($1, 0))',
      [`ledger:${key}`],
    );
  }

  public async findJournalByIdempotencyKey(
    key: string,
  ): Promise<LedgerJournal | null> {
    return await this.journalRepo.findOne({
      where: { idempotencyKey: key },
      relations: { entries: { account: true } },
    });
  }

  public async findAccountByCode(code: string): Promise<LedgerAccount | null> {
    return await this.accountRepo.findOne({ where: { code } });
  }

  public async insertAccountIfAbsent(
    account: Partial<LedgerAccount>,
  ): Promise<boolean> {
    const result = await this.accountRepo
      .createQueryBuilder()
      .insert()
      .into(LedgerAccount)
      .values(account)
      .orIgnore()
      .execute();
    return Array.isArray(result.raw) && result.raw.length > 0;
  }

  public async lockAccounts(ids: string[]): Promise<LedgerAccount[]> {
    if (!ids.length) return [];
    return await this.accountRepo
      .createQueryBuilder('account')
      .setLock('pessimistic_write')
      .where({ id: In(ids) })
      .orderBy('account.id', 'ASC')
      .getMany();
  }

  public async updateAccountBalance(
    id: string,
    balance: string,
  ): Promise<void> {
    await this.accountRepo.update(id, { balance });
  }

  public async saveJournal(journal: LedgerJournal): Promise<LedgerJournal> {
    return await this.journalRepo.save(journal);
  }
}
