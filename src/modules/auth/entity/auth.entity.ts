import { EmailVerificationStatus } from '@/src/common/enum/email-verification-status.enum';
import { PhoneVerificationStatus } from '@/src/common/enum/phone-verification-status';
import { Role } from '@/src/common/enum/role.enum';
import Base from 'src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity('auth')
@Index(['phone_number'])
export class Auth extends Base {
  @Column({
    unique: true,
  })
  email: string;

  @Column({ name: 'phone_number', nullable: true })
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

  @OneToOne(() => User, (user) => user.auth, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;
}
