import { Module } from '@nestjs/common';
import { MoneyOrderModule } from '../money-order/money-order.module';
import { PayoutService } from './service/payout.service';

@Module({
  imports: [MoneyOrderModule],
  providers: [PayoutService],
})
export class PayoutModule {}
