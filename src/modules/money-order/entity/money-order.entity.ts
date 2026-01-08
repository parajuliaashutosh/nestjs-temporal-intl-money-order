import Base from '@/src/common/entity/base.entity';
import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { Receiver } from '../../receiver/entity/receiver.entity';
import { User } from '../../user/entity/user.entity';

// like transaction
@Entity('money-order')
export class MoneyOrder extends Base {
  // storing in cents to avoid floating point issues
  @Column({ type: 'bigint', default: '0', name: 'sending_amount' })
  sendingAmount: string;

  @Column({ type: 'bigint', default: '0', name: 'receiver_amount' })
  receiverAmount: string;

  // storing in cents
  @Column({
    name: 'exchange_rate',
    type: 'decimal',
    precision: 18,
    scale: 8,
  })
  promiseExchangeRate: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => Receiver, (receiver) => receiver.moneyOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => User, (user) => user.receivers, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_id' })
  receiver: Receiver;
}
