import {
  BaseEntity,
  BeforeInsert,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import { v7 } from 'uuid';
import { BaseModel } from '../model/base.model';

abstract class Base extends BaseEntity implements BaseModel {
  @PrimaryColumn({ type: 'uuid' })
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;

  @BeforeInsert()
  generateId() {
    // this.id ??= v7();
    if (this.id === null || this.id === undefined) {
      this.id = v7();
    }
  }

  // @AfterInsert()
  // async logInsert() {
  //   if (Base.activityLogService) {
  //     const user = UserContextStorage.get()?.payload;
  //     await Base.activityLogService.log(
  //        this.constructor.name,
  //        this.id,
  //        'CREATE',
  //        user
  //     );
  //   }
  // }

  // @AfterUpdate()
  // async logUpdate() {
  //   if (Base.activityLogService) {
  //     const user = UserContextStorage.get()?.payload;
  //     await Base.activityLogService.log(
  //        this.constructor.name,
  //        this.id,
  //        'UPDATE',
  //        user
  //     );
  //   }
  // }

  // @AfterRemove()
  // async logRemove() {
  //   if (Base.activityLogService) {
  //     const user = UserContextStorage.get()?.payload;
  //     await Base.activityLogService.log(
  //        this.constructor.name,
  //        this.id,
  //        'DELETE',
  //        user
  //       );
  //   }
  // }
}

export default Base;
