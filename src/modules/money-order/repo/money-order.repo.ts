import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { MoneyOrderRepoContract } from '../contract/money-order.repo.contract';
import { FilterMoneyOrdersDTO } from '../dto/filter-money-orders.dto';
import {
  HistoricPoint,
  InflowPoint,
  MoneyOrderAnalyticsResult,
  NationSummary,
} from '../dto/money-order-analytics.dto';
import { MoneyOrderAnalytics } from '../entity/money-order-analytics.entity';
import { MoneyOrder } from '../entity/money-order.entity';
import { MoneyOrderModel } from '../model/money-order.model';

const ANALYTICS_TREND_DAYS = 30;

@Injectable()
export class MoneyOrderRepo implements MoneyOrderRepoContract {
  constructor(
    @InjectRepository(MoneyOrder)
    private moneyOrderRepo: Repository<MoneyOrder>,
    @InjectRepository(MoneyOrderAnalytics)
    private analyticsRepo: Repository<MoneyOrderAnalytics>,
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

  public async filter(
    filter: FilterMoneyOrdersDTO,
  ): Promise<DataAndCount<MoneyOrder[]>> {
    const query = this.moneyOrderRepo
      .createQueryBuilder('moneyOrder')
      .leftJoin('moneyOrder.user', 'user')
      .leftJoin('moneyOrder.receiver', 'receiver')
      // minimal projection for list views — full detail lives on findById
      .select([
        'moneyOrder.id',
        'moneyOrder.sendingAmount',
        'moneyOrder.receiverAmount',
        'moneyOrder.status',
        'moneyOrder.deliveryStatus',
        'moneyOrder.createdAt',
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.country',
        'receiver.id',
        'receiver.firstName',
        'receiver.lastName',
      ])
      // always scope to a single country
      .where('user.country = :country', { country: filter.country });

    if (filter.userId)
      query.andWhere('moneyOrder.user_id = :userId', {
        userId: filter.userId,
      });

    if (filter.status)
      query.andWhere('moneyOrder.status = :status', { status: filter.status });

    if (filter.deliveryStatus)
      query.andWhere('moneyOrder.delivery_status = :deliveryStatus', {
        deliveryStatus: filter.deliveryStatus,
      });

    const [data, count] = await query
      .orderBy('moneyOrder.created_at', 'DESC')
      .skip(filter.skip)
      .take(filter.limit)
      .getManyAndCount();

    return DataAndCount.builder<MoneyOrder[]>()
      .setData(data)
      .setCount(count)
      .build();
  }

  public async getAnalytics(
    country: SupportedCountry,
  ): Promise<MoneyOrderAnalyticsResult> {
    const view = this.analyticsRepo.metadata.tableName;

    // today, broken down by status — always scoped to a single country
    const todayRows = await this.analyticsRepo.query<
      {
        country: string | null;
        status: MoneyOrderStatus;
        order_count: number;
        total_sending_amount: string;
      }[]
    >(
      `SELECT country, status,
              SUM(order_count)::int AS order_count,
              SUM(total_sending_amount)::bigint AS total_sending_amount
         FROM ${view}
        WHERE day = CURRENT_DATE
          AND country = $1
        GROUP BY country, status`,
      [country],
    );

    // inflow over time — last N days, for this country
    const inflowRows = await this.analyticsRepo.query<
      {
        day: string;
        total_sending_amount: string;
        order_count: number;
      }[]
    >(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day,
              SUM(total_sending_amount)::bigint AS total_sending_amount,
              SUM(order_count)::int AS order_count
         FROM ${view}
        WHERE day >= CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'
          AND country = $2
        GROUP BY day
        ORDER BY day`,
      [ANALYTICS_TREND_DAYS, country],
    );

    // historic daily series, split by status, for this country
    const historicRows = await this.analyticsRepo.query<
      {
        day: string;
        status: MoneyOrderStatus;
        order_count: number;
        total_sending_amount: string;
      }[]
    >(
      `SELECT to_char(day, 'YYYY-MM-DD') AS day, status,
              SUM(order_count)::int AS order_count,
              SUM(total_sending_amount)::bigint AS total_sending_amount
         FROM ${view}
        WHERE day >= CURRENT_DATE - ($1::int - 1) * INTERVAL '1 day'
          AND country = $2
        GROUP BY day, status
        ORDER BY day, status`,
      [ANALYTICS_TREND_DAYS, country],
    );

    return this.assembleAnalytics(country, todayRows, inflowRows, historicRows);
  }

  private assembleAnalytics(
    country: SupportedCountry,
    todayRows: {
      country: string | null;
      status: MoneyOrderStatus;
      order_count: number;
      total_sending_amount: string;
    }[],
    inflowRows: {
      day: string;
      total_sending_amount: string;
      order_count: number;
    }[],
    historicRows: {
      day: string;
      status: MoneyOrderStatus;
      order_count: number;
      total_sending_amount: string;
    }[],
  ): MoneyOrderAnalyticsResult {
    const nationMap = new Map<string | null, NationSummary>();
    const todayByStatus: Partial<Record<MoneyOrderStatus, number>> = {};
    let todayTotalOrders = 0;
    let todayTotalSending = 0n;

    for (const row of todayRows) {
      const country = (row.country ?? null) as NationSummary['country'];
      const key = row.country ?? null;
      const sending = BigInt(row.total_sending_amount);

      let nation = nationMap.get(key);
      if (!nation) {
        nation = {
          country,
          totalOrders: 0,
          totalSendingAmount: '0',
          byStatus: {},
        };
        nationMap.set(key, nation);
      }

      nation.totalOrders += row.order_count;
      nation.totalSendingAmount = (
        BigInt(nation.totalSendingAmount) + sending
      ).toString();
      nation.byStatus[row.status] =
        (nation.byStatus[row.status] ?? 0) + row.order_count;

      todayByStatus[row.status] =
        (todayByStatus[row.status] ?? 0) + row.order_count;
      todayTotalOrders += row.order_count;
      todayTotalSending += sending;
    }

    const inflowTrend: InflowPoint[] = inflowRows.map((row) => ({
      day: row.day,
      totalSendingAmount: row.total_sending_amount,
      orderCount: row.order_count,
    }));

    const historic: HistoricPoint[] = historicRows.map((row) => ({
      day: row.day,
      status: row.status,
      orderCount: row.order_count,
      totalSendingAmount: row.total_sending_amount,
    }));

    return {
      country,
      today: {
        date: new Date().toISOString().slice(0, 10),
        totalOrders: todayTotalOrders,
        totalSendingAmount: todayTotalSending.toString(),
        byStatus: todayByStatus,
        byNation: Array.from(nationMap.values()),
      },
      inflowTrend,
      historic,
    };
  }

  public async refreshAnalytics(): Promise<void> {
    const view = this.analyticsRepo.metadata.tableName;
    await this.analyticsRepo.query(`REFRESH MATERIALIZED VIEW ${view}`);
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
