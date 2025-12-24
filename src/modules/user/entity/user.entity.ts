import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import Base from 'src/common/entity/base.entity';
import { Column, Entity, OneToOne } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';

@Entity('user')
export class User extends Base {
  @Column()
  firstName: string;

  @Column({ nullable: true })
  middleName?: string;

  @Column()
  lastName: string;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    name: 'kyc_status',
    default: KYCStatus.PENDING,
  })
  kycStatus: KYCStatus;

  @OneToOne(() => Auth, (auth) => auth.user, {
    cascade: true,
  })
  auth: Auth;
}
