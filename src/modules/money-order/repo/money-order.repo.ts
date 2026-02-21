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

  public async findByUserId(userId: string): Promise<MoneyOrder[]> {
    return await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('moneyOrder.receiver', 'receiver')
      .where('user.id = :userId', { userId })
      .orderBy('moneyOrder.createdAt', 'DESC')
      .getMany();
  }

  public async findByReceiverId(receiverId: string): Promise<MoneyOrder[]> {
    return await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('moneyOrder.receiver', 'receiver')
      .where('receiver.id = :receiverId', { receiverId })
      .orderBy('moneyOrder.createdAt', 'DESC')
      .getMany();
  }

  public async findByStatus(status: MoneyOrderStatus): Promise<MoneyOrder[]> {
    return await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('moneyOrder.receiver', 'receiver')
      .where('moneyOrder.status = :status', { status })
      .orderBy('moneyOrder.createdAt', 'DESC')
      .getMany();
  }

  public async findByDeliveryStatus(
    deliveryStatus: MoneyOrderDeliveryStatus,
  ): Promise<MoneyOrder[]> {
    return await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('moneyOrder.receiver', 'receiver')
      .where('moneyOrder.deliveryStatus = :deliveryStatus', { deliveryStatus })
      .orderBy('moneyOrder.createdAt', 'DESC')
      .getMany();
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

  public async delete(id: string): Promise<boolean> {
    const result = await this.moneyOrderRepo.delete(id);
    return result.affected > 0;
  }

  public async findAll(): Promise<MoneyOrder[]> {
    return await this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoinAndSelect('moneyOrder.user', 'user')
      .leftJoinAndSelect('moneyOrder.receiver', 'receiver')
      .orderBy('moneyOrder.createdAt', 'DESC')
      .getMany();
  }
}
