import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { MoneyOrderStatus } from '@/src/common/enum/money-order-status.enum';

export interface NationSummary {
  country: SupportedCountry | null;
  totalOrders: number;
  totalSendingAmount: string;
  byStatus: Partial<Record<MoneyOrderStatus, number>>;
}

export interface InflowPoint {
  day: string;
  totalSendingAmount: string;
  orderCount: number;
}

export interface HistoricPoint {
  day: string;
  status: MoneyOrderStatus;
  orderCount: number;
  totalSendingAmount: string;
}

export interface MoneyOrderAnalyticsResult {
  // analytics are always scoped to this single country
  country: SupportedCountry;
  // today, always grouped by nation
  today: {
    date: string;
    totalOrders: number;
    totalSendingAmount: string;
    byStatus: Partial<Record<MoneyOrderStatus, number>>;
    byNation: NationSummary[];
  };
  // inflow over time — for the inflow graph
  inflowTrend: InflowPoint[];
  // historic daily series, split by status
  historic: HistoricPoint[];
}
