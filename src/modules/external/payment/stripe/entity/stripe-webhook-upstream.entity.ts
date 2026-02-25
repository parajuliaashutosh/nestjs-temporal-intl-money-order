import { Column, Entity, Index } from 'typeorm';
import { StripeLogStatus } from '../enum/stripe-log.enum';
import { StripeLogBase } from './stripe-base-entity/stripe-log-base.entity';

@Entity('stripe_webhook_upstream')
@Index(['stripeId'], { unique: true })
export class StripeWebhookUpstream extends StripeLogBase {
  @Column()
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ nullable: true })
  webhookSignature?: string;

  @Column({ nullable: true })
  ipAddress?: string;

  @Column({
    type: 'enum',
    enum: StripeLogStatus,
  })
  status: StripeLogStatus;
}
