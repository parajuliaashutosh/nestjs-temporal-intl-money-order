// src/modules/activity-log/subscriber/activity-log.subscriber.ts
import { UserContextStorage } from '@/src/common/context/user.context';
import Base from '@/src/common/entity/base.entity';
import { Inject, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
    DataSource,
    EntitySubscriberInterface,
    EventSubscriber,
    InsertEvent,
    RemoveEvent,
    UpdateEvent,
} from 'typeorm';
import { ACTIVITY_LOG_SERVICE } from '../activity-log.constants';
import { ActivityLogService } from '../service/activity-log.service';

@Injectable()
@EventSubscriber()
export class ActivityLogSubscriber implements EntitySubscriberInterface<Base> {
  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @Inject(ACTIVITY_LOG_SERVICE)
    private readonly activityLogService: ActivityLogService,
  ) {
    // Register this subscriber with TypeORM
    dataSource.subscribers.push(this);
  }

  listenTo() {
    return Base;
  }

  async afterInsert(event: InsertEvent<Base>) {
    // Skip logging ActivityLog itself to avoid infinite loops
    if (event.entity.constructor.name === 'ActivityLog') return;

    const user = UserContextStorage.get()?.payload;

    await this.activityLogService.log(
      event.entity.constructor.name,
      event.entity.id,
      'CREATE',
      user,
    );
  }

  async afterUpdate(event: UpdateEvent<Base>) {
    if (!event.entity || event.entity.constructor.name === 'ActivityLog') return;

    const user = UserContextStorage.get()?.payload;

    await this.activityLogService.log(
      event.entity.constructor.name,
      (event.entity as Base)?.id,
      'UPDATE',
      user,
    );
  }

  async afterRemove(event: RemoveEvent<Base>) {
    if (!event.entity || event.entity.constructor.name === 'ActivityLog') return;

    const user = UserContextStorage.get()?.payload;

    await this.activityLogService.log(
      event.entity.constructor.name,
      event.entity?.id,
      'DELETE',
      user,
    );
  }
}