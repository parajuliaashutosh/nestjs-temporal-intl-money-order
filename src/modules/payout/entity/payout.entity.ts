import Base from '@/src/common/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('payout')
export class Payout extends Base {
  @Column()
  moneyOrderId: string;

  @Column({ type: 'jsonb' })
  request: any;

  @Column({ type: 'jsonb', nullable: true })
  response: any;

  @Column({ nullable: true })
  kind: string;

  @Column({ type: 'int', name: 'retry_count', default: 0 })
  retryCount: number;
}
