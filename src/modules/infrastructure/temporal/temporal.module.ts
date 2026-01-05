import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TemporalClientService } from './client/temporal-client.service';
import temporalConfig from './temporal.config';
import { TemporalWorkerService } from './worker/temporal-worker.service';

@Module({
  imports: [ConfigModule.forFeature(temporalConfig)],
  providers: [TemporalClientService, TemporalWorkerService],
  exports: [TemporalClientService],
})
export class TemporalModule {}