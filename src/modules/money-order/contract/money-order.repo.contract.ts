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
  findByIdempotentId(idempotentId: string): Promise<MoneyOrder | null>;
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
}
