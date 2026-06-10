import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';

export interface FilterMoneyOrdersDTO {
  // always scoped to a single country — never merge across countries
  country: SupportedCountry;
  page: number;
  limit: number;
  skip: number;
  userId?: string;
  status?: MoneyOrderStatus;
  deliveryStatus?: MoneyOrderDeliveryStatus;
}
