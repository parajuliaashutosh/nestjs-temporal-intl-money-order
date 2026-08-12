import { Module } from '@nestjs/common';
import { HealthController } from './gateway/rest/health.controller';

@Module({
  controllers: [HealthController],
})
export class HealthModule {}
