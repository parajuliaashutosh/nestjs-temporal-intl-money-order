import { EmailVerificationStatus } from '@/src/common/enum/email-verification-status.enum';
import { PhoneVerificationStatus } from '@/src/common/enum/phone-verification-status';
import { Role } from '@/src/common/enum/role.enum';
import Base from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
} from 'typeorm';
import { Admin } from '../../admin/entity/admin.entity';
import { User } from '../../user/entity/user.entity';
import { AuthModel } from '../model/auth.model';

@Entity('auth')
@Index(['phone'])
export class Auth extends Base implements AuthModel {
  @Column({
    unique: true,
  })
  email: string;

  @Column({ name: 'phone_number', nullable: true, unique: true })
  phone?: string;

  @Column({
    type: 'enum',
    enum: EmailVerificationStatus,
    name: 'email_verification_status',
    default: EmailVerificationStatus.UNVERIFIED,
  })
  emailVerificationStatus: EmailVerificationStatus;

  @Column({
    type: 'enum',
    enum: PhoneVerificationStatus,
    name: 'phone_verification_status',
    default: PhoneVerificationStatus.UNVERIFIED,
  })
  phoneVerificationStatus: PhoneVerificationStatus;

  @Column({
    type: 'enum',
    enum: Role,
    default: Role.USER,
  })
  role: Role;

  @Column({ select: false })
  password: string;

  @OneToMany(() => User, (user) => user.auth, {
    onDelete: 'CASCADE',
  })
  users: User[];

  @OneToOne(() => Admin, (admin) => admin.auth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'admin_id' })
  admin: Admin;
}
