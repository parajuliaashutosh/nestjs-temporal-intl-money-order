import { Column, Entity, Index } from 'typeorm';
import { StripeLogStatus, StripeOperationType } from '../enum/stripe-log.enum';
import { StripeLogBase } from './stripe-base-entity/stripe-log-base.entity';

@Entity('stripe_user_upstream')
@Index(['userId'])
export class StripeUserUpstream extends StripeLogBase {
  @Column({
    type: 'enum',
    enum: StripeOperationType,
  })
  operationType: StripeOperationType;

  @Column({
    type: 'enum',
    enum: StripeLogStatus,
  })
  status: StripeLogStatus;

  @Column({ type: 'jsonb', nullable: true, name: 'request_payload' })
  requestPayload?: Record<string, any>;
}
