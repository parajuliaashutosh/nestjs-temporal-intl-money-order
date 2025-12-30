import Base from '@/src/common/entity/base.entity';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { Column, Entity, Index, JoinColumn, OneToOne } from 'typeorm';
import { User } from '../../user/entity/user.entity';

@Entity('wallet')
@Index(['user'], { unique: true })
export class Wallet extends Base {
  // storing in cents to avoid floating point issues
  @Column({ type: 'bigint', default: '0' })
  balance: string;

  @Column({
    type: 'enum',
    enum: SupportedCurrency,
  })
  currency: SupportedCurrency;

  @OneToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn()
  user: User;
}
