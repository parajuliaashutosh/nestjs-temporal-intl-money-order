import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { MoneyOrderModule } from '../money-order/money-order.module';
import { TemporalModule } from '../temporal/temporal.module';
import { MoneyOrderController } from './gateway/rest/money-order.controller';
import { MONEY_ORDER_ORCHESTRATOR_SERVICE } from './money-order-orchestrator.constant';
import { MoneyOrderOrchestratorService } from './service/money-order-orchestrator.service';

@Module({
  imports: [MoneyOrderModule, TemporalModule, AuthModule],
  providers: [
    {
      provide: MONEY_ORDER_ORCHESTRATOR_SERVICE,
      useClass: MoneyOrderOrchestratorService,
    },
  ],
  controllers: [MoneyOrderController],
})
export class MoneyOrderOrchestratorModule {}
