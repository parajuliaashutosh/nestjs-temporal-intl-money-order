import Base from '@/src/common/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { MoneyOrder } from '../../money-order/entity/money-order.entity';
import { User } from '../../user/entity/user.entity';

@Entity('receiver')
export class Receiver extends Base {
  @Column({ name: 'first_name', nullable: false })
  firstName: string;

  @Column({ name: 'middle_name', nullable: true })
  middleName?: string;

  @Column({ name: 'last_name', nullable: false })
  lastName: string;

  @Column({ name: 'email', nullable: true })
  email: string;

  @Column({ name: 'phone_number', nullable: true })
  phoneNumber: string;

  @Column({ name: 'address', nullable: true })
  address: string;

  @Column({ name: 'bank_name', nullable: false })
  bankName: string;

  @Column({ name: 'bank_account_number', nullable: false })
  bankAccountNumber: string;

  @ManyToOne(() => User, (user) => user.receivers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => MoneyOrder, (moneyOrder) => moneyOrder.receiver)
  moneyOrders: MoneyOrder[];
}
