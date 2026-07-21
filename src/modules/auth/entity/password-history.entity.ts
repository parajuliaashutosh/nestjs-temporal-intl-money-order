import Base from '@/src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { PasswordHistoryModel } from '../model/password-history.model';
import { Auth } from './auth.entity';

@Entity('password_history')
@Index(['auth'])
export class PasswordHistory extends Base implements PasswordHistoryModel {
  @Column({ select: false })
  password: string;

  @ManyToOne(() => Auth, (auth) => auth.passwordHistories, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auth_id' })
  auth: Auth;
}
