import { Payout } from '../entity/payout.entity';

export interface PayoutRepoContract {
  create(payout: Partial<Payout>): Promise<Payout>;
  save(payout: Payout): Promise<Payout>;
  findById(id: string): Promise<Payout | null>;
  update(id: string, payout: Partial<Payout>): Promise<Payout | null>;
  findByMoneyOrderId(id: string): Promise<Payout | null>;
}
