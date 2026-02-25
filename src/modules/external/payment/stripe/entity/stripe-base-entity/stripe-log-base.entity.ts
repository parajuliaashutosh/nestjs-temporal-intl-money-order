import Base from '@/src/common/entity/base.entity';
import { Column } from 'typeorm';

export abstract class StripeLogBase extends Base {
  /** Stripe resource ID (payment_intent_id, event_id, etc.) */
  @Column({ nullable: true })
  stripeId?: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'bigint', nullable: true })
  amount?: number;

  @Column({ nullable: true })
  currency?: string;

  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  @Column({ nullable: true })
  errorCode?: string;

  @Column({ nullable: true })
  errorType?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
