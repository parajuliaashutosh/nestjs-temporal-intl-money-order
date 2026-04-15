import Base from '@/src/common/entity/base.entity';
import { Column } from 'typeorm';

export class Payout extends Base {
  @Column()
  moneyOrderId: string;

  @Column({ type: 'jsonb' })
  request: any;

  @Column({ type: 'jsonb', nullable: true })
  response: any;
}
