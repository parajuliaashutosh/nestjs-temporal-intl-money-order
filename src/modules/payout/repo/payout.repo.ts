import { InjectRepository } from '@nestjs/typeorm';
import { Repository, type QueryDeepPartialEntity } from 'typeorm';
import type { PayoutRepoContract } from '../contract/payout.repo.contract';
import { Payout } from '../entity/payout.entity';

export class PayoutRepo implements PayoutRepoContract {
  constructor(
    @InjectRepository(Payout) private payoutRepo: Repository<Payout>,
  ) {}

  async create(payout: Partial<Payout>): Promise<Payout> {
    const entity = this.payoutRepo.create(payout as Payout);
    return await this.payoutRepo.save(entity);
  }

  async save(payout: Payout): Promise<Payout> {
    return await this.payoutRepo.save(payout);
  }

  async findById(id: string): Promise<Payout | null> {
    return await this.payoutRepo
      .createQueryBuilder('payout')
      .where('payout.id = :id', { id })
      .getOne();
  }

  async findByMoneyOrderId(id: string): Promise<Payout | null> {
    return await this.payoutRepo
      .createQueryBuilder('payout')
      .where('payout.moneyOrderId = :id', { id })
      .getOne();
  }

  async update(id: string, payout: Partial<Payout>): Promise<Payout | null> {
    await this.payoutRepo.update(id, payout as QueryDeepPartialEntity<Payout>);
    return await this.findById(id);
  }
}
