import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { StripeWebhookUpstreamRepoContract } from '../contract/stripe-webhook-upstream.repo.contract';
import { StripeWebhookUpstream } from '../entity/stripe-webhook-upstream.entity';
import { StripeLogStatus } from '../enum/stripe-log.enum';

@Injectable()
export class StripeWebhookUpstreamRepo implements StripeWebhookUpstreamRepoContract {
  private readonly logger = new Logger(StripeWebhookUpstreamRepo.name);

  constructor(
    @InjectRepository(StripeWebhookUpstream)
    private readonly repository: Repository<StripeWebhookUpstream>,
  ) {}

  public async create(
    data: Partial<StripeWebhookUpstream>,
  ): Promise<StripeWebhookUpstream | null> {
    try {
      const log = this.repository.create(data);
      return await this.repository.save(log);
    } catch (error) {
      this.logger.error(
        `Failed to create stripe webhook upstream log: ${error}`,
      );
      return null;
    }
  }

  public async findByStripeId(
    stripeId: string,
  ): Promise<StripeWebhookUpstream | null> {
    return await this.repository.findOne({
      where: { stripeId },
    });
  }

  public async findByUserId(userId: string): Promise<StripeWebhookUpstream[]> {
    return await this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByEventType(
    eventType: string,
  ): Promise<StripeWebhookUpstream[]> {
    return await this.repository.find({
      where: { eventType },
      order: { createdAt: 'DESC' },
    });
  }

  public async findByStatus(
    status: StripeLogStatus,
  ): Promise<StripeWebhookUpstream[]> {
    return await this.repository.find({
      where: { status },
      order: { createdAt: 'DESC' },
    });
  }

  public async updateStatus(
    id: string,
    status: StripeLogStatus,
  ): Promise<StripeWebhookUpstream | null> {
    await this.repository.update(id, { status });
    return await this.repository.findOne({ where: { id } });
  }

  public async update(
    id: string,
    data: Partial<StripeWebhookUpstream>,
  ): Promise<StripeWebhookUpstream | null> {
    await this.repository.update(id, data);
    return await this.repository.findOne({ where: { id } });
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return result.affected > 0;
  }
}
