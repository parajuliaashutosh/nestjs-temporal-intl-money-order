import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfigLog } from './entity/system-config-log.entity';
import { SystemConfigLogController } from './gateway/rest/system-config-log.controller';
import { SystemConfigLogRepo } from './repo/system-config-log.repo';
import { SystemConfigLogService } from './service/system-config-log.service';
import {
  SYSTEM_CONFIG_LOG_REPO,
  SYSTEM_CONFIG_LOG_SERVICE,
} from './system-config-log.constant';

@Module({
  imports: [TypeOrmModule.forFeature([SystemConfigLog])],
  providers: [
    {
      provide: SYSTEM_CONFIG_LOG_SERVICE,
      useClass: SystemConfigLogService,
    },
    {
      provide: SYSTEM_CONFIG_LOG_REPO,
      useClass: SystemConfigLogRepo,
    },
  ],
  controllers: [SystemConfigLogController],
  exports: [SYSTEM_CONFIG_LOG_SERVICE],
})
export class SystemConfigLogModule {}
