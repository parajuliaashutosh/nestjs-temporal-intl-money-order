import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { ReceiverModule } from '../receiver/receiver.module';
import { SystemConfigModule } from '../system-config/system-config.module';
import { UserModule } from '../user/user.module';
import { WalletModule } from '../wallet/wallet.module';
import { MoneyOrderAnalytics } from './entity/money-order-analytics.entity';
import { MoneyOrder } from './entity/money-order.entity';
import { MoneyOrderAnalyticsRefreshJob } from './job/money-order-analytics-refresh.job';
import { MONEY_ORDER_FACTORY, MONEY_ORDER_REPO } from './money-order.constant';
import { MoneyOrderRepo } from './repo/money-order.repo';
import { AusMoneyOrderService } from './service/aus/aus-money-order.service';
import { MoneyOrderFactory } from './service/money-order.factory';
import { UsaMoneyOrderService } from './service/usa/usa-money-order.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MoneyOrder, MoneyOrderAnalytics]),
    ReceiverModule,
    SystemConfigModule,
    UserModule,
    AuthModule,
    WalletModule,
  ],
  providers: [
    UsaMoneyOrderService,
    AusMoneyOrderService,
    {
      provide: MONEY_ORDER_FACTORY,
      useClass: MoneyOrderFactory,
    },
    {
      provide: MONEY_ORDER_REPO,
      useClass: MoneyOrderRepo,
    },
    MoneyOrderAnalyticsRefreshJob,
  ],
  exports: [MONEY_ORDER_FACTORY, MONEY_ORDER_REPO],
})
export class MoneyOrderModule {}
