import { UserContextPayload } from '@/src/common/context/user.context';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ActivityLog } from '../entity/activity-log.entity';

@Injectable()
export class ActivityLogService {
  constructor(
    @InjectRepository(ActivityLog)
    private readonly activityLogRepo: Repository<ActivityLog>,
  ) {}

  public async log(
    entity: string,
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    user?: UserContextPayload,
  ): Promise<void> {
    try {
      const activityLog = new ActivityLog();
      activityLog.entity = entity;
      activityLog.entityId = entityId;
      activityLog.action = action;
      activityLog.authId = user?.id ?? '';
        
      activityLog.payload = { ...user } ;
      await this.activityLogRepo.save(activityLog);
      return;
    } catch (error) {
      console.error('Error logging activity:', error);
    }
  }
}
