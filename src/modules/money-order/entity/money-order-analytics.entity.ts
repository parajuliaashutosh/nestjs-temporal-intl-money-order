import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { MoneyOrderStatus } from '@/src/common/enum/money-order-status.enum';
import { ViewColumn, ViewEntity } from 'typeorm';

/**
 * Materialized view that pre-aggregates money orders at a
 * (day, country, status) grain. Every analytics figure the API serves
 * (today-by-nation, status breakdown, inflow trend, historic series) is
 * derived from this view so the read path never scans the raw table.
 *
 * Refreshed hourly — see MoneyOrderAnalyticsRefreshJob.
 */
@ViewEntity({
  name: 'money_order_analytics',
  materialized: true,
  expression: `
    SELECT
      (mo.created_at AT TIME ZONE 'UTC')::date AS day,
      u.country_code                            AS country,
      mo.status                                 AS status,
      COUNT(*)::int                             AS order_count,
      COALESCE(SUM(mo.sending_amount), 0)::bigint  AS total_sending_amount,
      COALESCE(SUM(mo.receiver_amount), 0)::bigint AS total_receiver_amount
    FROM "money-order" mo
    LEFT JOIN "user" u ON u.id = mo.user_id
    WHERE mo.deleted_at IS NULL
    GROUP BY 1, 2, 3
  `,
})
export class MoneyOrderAnalytics {
  @ViewColumn()
  day: string;

  @ViewColumn()
  country: SupportedCountry | null;

  @ViewColumn()
  status: MoneyOrderStatus;

  @ViewColumn({ name: 'order_count' })
  orderCount: number;

  @ViewColumn({ name: 'total_sending_amount' })
  totalSendingAmount: string;

  @ViewColumn({ name: 'total_receiver_amount' })
  totalReceiverAmount: string;
}
