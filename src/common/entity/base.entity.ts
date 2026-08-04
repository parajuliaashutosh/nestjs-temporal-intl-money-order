import {
  BaseEntity,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { BaseModel } from '../model/base.model';

abstract class Base extends BaseEntity implements BaseModel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', select: false })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at', select: false })
  deletedAt: Date;
}

export default Base;
