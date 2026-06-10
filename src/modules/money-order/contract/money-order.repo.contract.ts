import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { FilterMoneyOrdersDTO } from '../dto/filter-money-orders.dto';
import { MoneyOrderAnalyticsResult } from '../dto/money-order-analytics.dto';
import { MoneyOrder } from '../entity/money-order.entity';
import { MoneyOrderModel } from '../model/money-order.model';

export interface MoneyOrderRepoContract {
  create(moneyOrder: Partial<MoneyOrderModel>): Promise<MoneyOrder>;
  save(moneyOrder: MoneyOrder): Promise<MoneyOrder>;
  findById(id: string): Promise<MoneyOrder | null>;
  findByIdempotentId(idempotentId: string): Promise<MoneyOrder | null>;
  filter(
    filter: FilterMoneyOrdersDTO,
  ): Promise<DataAndCount<MoneyOrder[]>>;
  getAnalytics(country: SupportedCountry): Promise<MoneyOrderAnalyticsResult>;
  refreshAnalytics(): Promise<void>;
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
