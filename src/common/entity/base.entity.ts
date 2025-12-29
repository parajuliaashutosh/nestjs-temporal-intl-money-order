import { ActivityLogService } from '@/src/modules/activity-log/service/activity-log.service';
import {
  AfterInsert,
  AfterRemove,
  AfterUpdate,
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { UserContextStorage } from '../context/user.context';

abstract class Base extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  // static reference to ActivityLogService
  static activityLogService: ActivityLogService;

  static setActivityLogService(service: ActivityLogService) {
    Base.activityLogService = service;
  }

  @AfterInsert()
  async logInsert() {
    if (Base.activityLogService) {
      const user = UserContextStorage.get()?.payload;
      await Base.activityLogService.log(
         this.constructor.name,
         this.id,
         'CREATE',
         user
      );
    }
  }

  @AfterUpdate()
  async logUpdate() {
    if (Base.activityLogService) {
      const user = UserContextStorage.get()?.payload;
      await Base.activityLogService.log(
         this.constructor.name,
         this.id,
         'UPDATE',
         user
      );
    }
  }

  @AfterRemove()
  async logRemove() {
    if (Base.activityLogService) {
      const user = UserContextStorage.get()?.payload;
      await Base.activityLogService.log(
         this.constructor.name,
         this.id,
         'DELETE',
         user
        );
    }
  }
}

export default Base;
