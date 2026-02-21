import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { StripeDownstreamRepoContract } from '../contract/stripe-downstream.repo.contract';
import { StripeDownstreamLog } from '../entity/stripe-api-downstream.entity';
import { StripeLogStatus, StripeOperationType } from '../enum/stripe-log.enum';

@Injectable()
export class StripeDownstreamRepo implements StripeDownstreamRepoContract {
  private readonly logger = new Logger(StripeDownstreamRepo.name);

  constructor(
    @InjectRepository(StripeDownstreamLog)
    private readonly repository: Repository<StripeDownstreamLog>,
  ) {}

  public async create(
    data: Partial<StripeDownstreamLog>,
  ): Promise<StripeDownstreamLog | null> {
    try {
      const log = this.repository.create(data);
      return await this.repository.save(log);
    } catch (error) {
      this.logger.error(`Failed to create stripe downstream log: ${error}`);
      return null;
    }
  }

  public async findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<StripeDownstreamLog | null> {
    return await this.repository
      .createQueryBuilder('log')
      .where('log.idempotencyKey = :idempotencyKey', { idempotencyKey })
      .getOne();
  }

  public async findByStripeId(
    stripeId: string,
  ): Promise<StripeDownstreamLog[]> {
    return await this.repository.find({
      where: { stripeId },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByUserId(userId: string): Promise<StripeDownstreamLog[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByStatus(
    status: StripeLogStatus,
  ): Promise<StripeDownstreamLog[]> {
    return await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByOperationType(
    operationType: StripeOperationType,
  ): Promise<StripeDownstreamLog[]> {
    return await this.repository.find({
      where: { operationType },
      order: { createdAt: 'DESC' },
    });
  }

  public async updateStatus(
    id: string,
    status: StripeLogStatus,
  ): Promise<StripeDownstreamLog | null> {
    await this.repository.update(id, { status });
    return await this.repository.findOne({ where: { id } });
  }

  public async update(
    id: string,
    data: Partial<StripeDownstreamLog>,
  ): Promise<StripeDownstreamLog | null> {
    await this.repository.update(id, data);
    return await this.repository.findOne({ where: { id } });
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
