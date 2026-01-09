import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import Base from 'src/common/entity/base.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { MoneyOrder } from '../../money-order/entity/money-order.entity';
import { Receiver } from '../../receiver/entity/receiver.entity';

@Entity('user')
@Index(['auth', 'country'], { unique: true })
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

  @Column({
    type: 'enum',
    enum: SupportedCountry,
    name: 'country_code',
    nullable: true,
  })
  country: SupportedCountry;

  @ManyToOne(() => Auth, (auth) => auth.users, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'auth_id' })
  auth: Auth;

  @OneToMany(() => MoneyOrder, (moneyOrder) => moneyOrder.user, {
    onDelete: 'CASCADE',
  })
  moneyOrders: MoneyOrder[];

  @OneToMany(() => Receiver, (receiver) => receiver.user)
  receivers: Receiver[];
}
