import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { StripeUserUpstreamRepoContract } from '../contract/stripe-user-upstream.repo.contract';
import { StripeUserUpstream } from '../entity/stripe-user-upstream.entity';
import { StripeLogStatus, StripeOperationType } from '../enum/stripe-log.enum';

@Injectable()
export class StripeUserUpstreamRepo implements StripeUserUpstreamRepoContract {
  private readonly logger = new Logger(StripeUserUpstreamRepo.name);

  constructor(
    @InjectRepository(StripeUserUpstream)
    private readonly repository: Repository<StripeUserUpstream>,
  ) {}

  public async create(
    data: Partial<StripeUserUpstream>,
  ): Promise<StripeUserUpstream | null> {
    try {
      const log = this.repository.create(data);
      return await this.repository.save(log);
    } catch (error) {
      this.logger.error(`Failed to create stripe user upstream log: ${error}`);
      return null;
    }
  }

  public async findByStripeId(stripeId: string): Promise<StripeUserUpstream[]> {
    return await this.repository.find({
      where: { stripeId },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByUserId(userId: string): Promise<StripeUserUpstream[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByStatus(
    status: StripeLogStatus,
  ): Promise<StripeUserUpstream[]> {
    return await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByOperationType(
    operationType: StripeOperationType,
  ): Promise<StripeUserUpstream[]> {
    return await this.repository.find({
      where: { operationType },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByUserIdAndOperationType(
    userId: string,
    operationType: StripeOperationType,
  ): Promise<StripeUserUpstream[]> {
    return await this.repository.find({
      where: { userId, operationType },
      order: { createdAt: 'DESC' },
    });
  }

  public async updateStatus(
    id: string,
    status: StripeLogStatus,
  ): Promise<StripeUserUpstream | null> {
    await this.repository.update(id, { status });
    return await this.repository.findOne({ where: { id } });
  }

  public async update(
    id: string,
    data: Partial<StripeUserUpstream>,
  ): Promise<StripeUserUpstream | null> {
    await this.repository.update(id, data);
    return await this.repository.findOne({ where: { id } });
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
