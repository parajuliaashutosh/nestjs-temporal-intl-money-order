import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MoneyOrderRepoContract } from '../contract/money-order.repo.contract';
import { MoneyOrder } from '../entity/money-order.entity';
import { MoneyOrderModel } from '../model/money-order.model';

@Injectable()
export class MoneyOrderRepo implements MoneyOrderRepoContract {
  constructor(
    @InjectRepository(MoneyOrder)
    private moneyOrderRepo: Repository<MoneyOrder>,
  ) {}

  public async create(
    moneyOrder: Partial<MoneyOrderModel>,
  ): Promise<MoneyOrder> {
    return await this.moneyOrderRepo.save(moneyOrder);
  }

  public async save(moneyOrder: MoneyOrder): Promise<MoneyOrder> {
    return await this.moneyOrderRepo.save(moneyOrder);
  }

  public async findById(id: string): Promise<MoneyOrder | null> {
    return await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('moneyOrder.receiver', 'receiver')
      .where('moneyOrder.id = :id', { id })
      .getOne();
  }

  public async findByIdempotentId(
    idempotentId: string,
  ): Promise<MoneyOrder | null> {
    return await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .where('moneyOrder.idempotentId = :idempotentId', { idempotentId })
      .getOne();
  }

  public async updateStatus(
    id: string,
    status: MoneyOrderStatus,
  ): Promise<MoneyOrder | null> {
    await this.moneyOrderRepo.update(id, { status });
    return await this.findById(id);
  }

  public async updateDeliveryStatus(
    id: string,
    deliveryStatus: MoneyOrderDeliveryStatus,
  ): Promise<MoneyOrder | null> {
    await this.moneyOrderRepo.update(id, { deliveryStatus });
    return await this.findById(id);
  }

  public async update(
    id: string,
    moneyOrder: Partial<MoneyOrderModel>,
  ): Promise<MoneyOrder | null> {
    await this.moneyOrderRepo.update(id, moneyOrder);
    return await this.findById(id);
  }
}
