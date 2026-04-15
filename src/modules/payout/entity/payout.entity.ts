import Base from '@/src/common/entity/base.entity';
import { Column, Entity } from 'typeorm';

@Entity('payout')
export class Payout extends Base {
  @Column({ unique: true })
  moneyOrderId: string;

  @Column({ type: 'jsonb' })
  request: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  response: Record<string, any> | null;

  // here can be many responses
  @Column({ type: 'jsonb', nullable: true })
  errResponses: Record<string, any> | null;

  @Column({ type: 'int', name: 'retry_count', default: 0 })
  retryCount: number;
}
