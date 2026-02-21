import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { MoneyOrder } from '../entity/money-order.entity';
import { MoneyOrderModel } from '../model/money-order.model';

export interface MoneyOrderRepoContract {
  create(moneyOrder: Partial<MoneyOrderModel>): Promise<MoneyOrder>;
  save(moneyOrder: MoneyOrder): Promise<MoneyOrder>;
  findById(id: string): Promise<MoneyOrder | null>;
  findByUserId(userId: string): Promise<MoneyOrder[]>;
  findByReceiverId(receiverId: string): Promise<MoneyOrder[]>;
  findByStatus(status: MoneyOrderStatus): Promise<MoneyOrder[]>;
  findByDeliveryStatus(
    deliveryStatus: MoneyOrderDeliveryStatus,
  ): Promise<MoneyOrder[]>;
  updateStatus(
    id: string,
    status: MoneyOrderStatus,
  ): Promise<MoneyOrder | null>;
  updateDeliveryStatus(
    id: string,
    deliveryStatus: MoneyOrderDeliveryStatus,
  ): Promise<MoneyOrder | null>;
  update(
    id: string,
    moneyOrder: Partial<MoneyOrderModel>,
  ): Promise<MoneyOrder | null>;
  delete(id: string): Promise<boolean>;
  findAll(): Promise<MoneyOrder[]>;
}
