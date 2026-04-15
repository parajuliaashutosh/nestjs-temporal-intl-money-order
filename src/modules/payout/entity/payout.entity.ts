import Base from '@/src/common/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('payout')
export class Payout extends Base {
  @Column({ unique: true })
  moneyOrderId: string;

  @Column({ type: 'jsonb' })
  request: any;

  @Column({ type: 'jsonb', nullable: true })
  response: any;

  // here can be many responses
  @Column({ type: 'jsonb', nullable: true })
  errResponses: any;

  @Column({ type: 'int', name: 'retry_count', default: 0 })
  retryCount: number;
}
