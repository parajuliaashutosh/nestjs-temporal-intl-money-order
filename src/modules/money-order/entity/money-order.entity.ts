import Base from '@/src/common/entity/base.entity';
import { MoneyOrderDeliveryStatus, MoneyOrderStatus } from '@/src/common/enum/money-order-status.enum';
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

  @Column({
    type: 'enum',
    enum: MoneyOrderStatus,
    name: 'status',
    default: MoneyOrderStatus.INITIATED,
  })
  status: MoneyOrderStatus;

  @Column({
    type: 'enum',
    enum: MoneyOrderDeliveryStatus,
    name: 'delivery_status',
    default: MoneyOrderDeliveryStatus.DELIVERY_NOT_AUTHORIZED,
  })
  deliveryStatus: MoneyOrderDeliveryStatus;

  @Column({ type: 'jsonb', nullable: true })
  metadata: any;

  @ManyToOne(() => User, (user) => user.moneyOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ManyToOne(() => Receiver, (receiver) => receiver.moneyOrders, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'receiver_id' })
  receiver: Receiver;
}
