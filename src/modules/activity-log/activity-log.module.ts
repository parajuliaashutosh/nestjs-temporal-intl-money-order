import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ACTIVITY_LOG_SERVICE } from './activity-log.constants';
import { ActivityLog } from './entity/activity-log.entity';
import { ActivityLogService } from './service/activity-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([ActivityLog])],
    providers: [
        {
            provide: ACTIVITY_LOG_SERVICE,
            useClass: ActivityLogService,
        }
    ],
    exports: [ACTIVITY_LOG_SERVICE],
})
export class ActivityLogModule {}
