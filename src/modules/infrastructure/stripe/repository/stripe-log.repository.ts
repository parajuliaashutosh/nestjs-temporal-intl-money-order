import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StripeLog } from '../entity/stripe-log.entity';
import {
  CreateStripeLogDTO,
  StripeLogDirection,
  StripeLogStatus,
} from './dto/stripe-log.dto';

@Injectable()
export class StripeLogRepository {
  private readonly logger = new Logger(StripeLogRepository.name);

  constructor(
    @InjectRepository(StripeLog)
    private readonly repository: Repository<StripeLog>,
  ) {}

  /**
   * Create a new Stripe log entry
   */
  async create(data: CreateStripeLogDTO): Promise<StripeLog> {
    try {
      const log = this.repository.create(data);
      return await this.repository.save(log);
    } catch (error) {
      this.logger.error(`Failed to create stripe log: ${error}`);
      // Don't throw - logging should not break the main flow
      return null;
    }
  }

  /**
   * Find logs by Stripe ID
   */
  async findByStripeId(stripeId: string): Promise<StripeLog[]> {
    return this.repository.find({
      where: { stripeId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Find logs by user ID
   */
  async findByUserId(
    userId: string,
    options?: { limit?: number; offset?: number },
  ): Promise<StripeLog[]> {
    return this.repository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Find logs by direction (upstream/downstream)
   */
  async findByDirection(
    direction: StripeLogDirection,
    options?: { limit?: number; offset?: number },
  ): Promise<StripeLog[]> {
    return this.repository.find({
      where: { direction },
      order: { createdAt: 'DESC' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Find failed operations
   */
  async findFailed(options?: {
    limit?: number;
    offset?: number;
    direction?: StripeLogDirection;
  }): Promise<StripeLog[]> {
    const where: {
      status: StripeLogStatus;
      direction?: StripeLogDirection;
    } = { status: StripeLogStatus.FAILED };

    if (options?.direction) {
      where.direction = options.direction;
    }

    return this.repository.find({
      where,
      order: { createdAt: 'DESC' },
      take: options?.limit ?? 50,
      skip: options?.offset ?? 0,
    });
  }

  /**
   * Get logs within a date range
   */
  async findByDateRange(
    startDate: Date,
    endDate: Date,
    options?: { direction?: StripeLogDirection; status?: StripeLogStatus },
  ): Promise<StripeLog[]> {
    const queryBuilder = this.repository
      .createQueryBuilder('log')
      .where('log.createdAt >= :startDate', { startDate })
      .andWhere('log.createdAt <= :endDate', { endDate });

    if (options?.direction) {
      queryBuilder.andWhere('log.direction = :direction', {
        direction: options.direction,
      });
    }

    if (options?.status) {
      queryBuilder.andWhere('log.status = :status', { status: options.status });
    }

    return queryBuilder.orderBy('log.createdAt', 'DESC').getMany();
  }

  /**
   * Get summary statistics
   */
  async getStatistics(
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalUpstream: number;
    totalDownstream: number;
    successCount: number;
    failedCount: number;
    totalAmount: number;
  }> {
    const queryBuilder = this.repository.createQueryBuilder('log');

    if (startDate) {
      queryBuilder.andWhere('log.createdAt >= :startDate', { startDate });
    }
    if (endDate) {
      queryBuilder.andWhere('log.createdAt <= :endDate', { endDate });
    }

    const results = await Promise.all([
      queryBuilder
        .clone()
        .andWhere('log.direction = :direction', {
          direction: StripeLogDirection.UPSTREAM,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('log.direction = :direction', {
          direction: StripeLogDirection.DOWNSTREAM,
        })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('log.status = :status', { status: StripeLogStatus.SUCCESS })
        .getCount(),
      queryBuilder
        .clone()
        .andWhere('log.status = :status', { status: StripeLogStatus.FAILED })
        .getCount(),
      queryBuilder
        .clone()
        .select('SUM(log.amount)', 'total')
        .andWhere('log.status = :status', { status: StripeLogStatus.SUCCESS })
        .getRawOne<{ total: string | null }>(),
    ]);

    const [totalUpstream, totalDownstream, successCount, failedCount] = results;
    const sumResult = results[4];

    return {
      totalUpstream,
      totalDownstream,
      successCount,
      failedCount,
      totalAmount: Number(sumResult?.total ?? 0),
    };
  }
}
