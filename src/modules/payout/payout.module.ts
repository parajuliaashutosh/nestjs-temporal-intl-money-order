import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoneyOrderModule } from '../money-order/money-order.module';
import { Payout } from './entity/payout.entity';
import { PAYOUT_REPO } from './payout.constant';
import { PayoutRepo } from './repo/payout.repo';
import { PayoutService } from './service/payout.service';

@Module({
  imports: [TypeOrmModule.forFeature([Payout]), MoneyOrderModule],
  providers: [
    PayoutService,
    {
      provide: PAYOUT_REPO,
      useClass: PayoutRepo,
    },
  ],
  exports: [],
})
export class PayoutModule {}
