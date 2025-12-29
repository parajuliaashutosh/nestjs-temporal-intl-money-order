import { Module } from '@nestjs/common';
import { SystemConfigService } from './service/system-config.service';

@Module({
  providers: [SystemConfigService]
})
export class SystemConfigModule {}
