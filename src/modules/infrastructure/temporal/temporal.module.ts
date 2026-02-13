import { Module } from '@nestjs/common';
import { MoneyOrderModule } from '../../money-order/money-order.module';
import { TemporalClientService } from './client/temporal-client.service';
import { TemporalWorkerService } from './worker/temporal-worker.service';
import { WORKFLOW_CLIENT, WORKFLOW_WORKER } from './workflow.constant';

@Module({
  imports: [MoneyOrderModule],
  providers: [
    TemporalClientService,
    TemporalWorkerService,
    {
      provide: WORKFLOW_WORKER,
      useClass: TemporalWorkerService,
    },
    {
      provide: WORKFLOW_CLIENT,
      useClass: TemporalClientService,
    },
  ],
  exports: [WORKFLOW_CLIENT, WORKFLOW_WORKER],
})
export class TemporalModule {}
