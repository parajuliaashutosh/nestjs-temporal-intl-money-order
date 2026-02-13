import Base from '@/src/common/entity/base.entity';
import { Column, Entity, Index } from 'typeorm';
import {
  StripeLogDirection,
  StripeLogStatus,
  StripeOperationType,
} from '../repository/dto/stripe-log.dto';

@Entity('stripe_log')
@Index(['direction', 'createdAt'])
@Index(['stripeId'])
@Index(['userId'])
@Index(['status'])
export class StripeLog extends Base {
  @Column({
    type: 'enum',
    enum: StripeLogDirection,
  })
  direction: StripeLogDirection;

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

  /** Stripe resource ID (payment_intent_id, event_id, etc.) */
  @Column({ nullable: true })
  stripeId?: string;

  /** Associated user ID if available */
  @Column({ nullable: true })
  userId?: string;

  /** Amount in cents (smallest currency unit) */
  @Column({ type: 'bigint', nullable: true })
  amount?: number;

  /** Currency code (usd, eur, etc.) */
  @Column({ nullable: true })
  currency?: string;

  /** Idempotency key used for the request */
  @Column({ nullable: true })
  idempotencyKey?: string;

  /** Request payload sent to Stripe (for upstream) */
  @Column({ type: 'jsonb', nullable: true })
  requestPayload?: Record<string, any>;

  /** Response received from Stripe (for upstream) or webhook payload (for downstream) */
  @Column({ type: 'jsonb', nullable: true })
  responsePayload?: Record<string, any>;

  /** Error message if operation failed */
  @Column({ type: 'text', nullable: true })
  errorMessage?: string;

  /** Error code from Stripe */
  @Column({ nullable: true })
  errorCode?: string;

  /** Stripe error type */
  @Column({ nullable: true })
  errorType?: string;

  /** HTTP status code (for API calls) */
  @Column({ type: 'int', nullable: true })
  httpStatusCode?: number;

  /** Processing time in milliseconds */
  @Column({ type: 'int', nullable: true })
  processingTimeMs?: number;

  /** Webhook signature (for downstream verification audit) */
  @Column({ nullable: true })
  webhookSignature?: string;

  /** IP address of the request origin */
  @Column({ nullable: true })
  ipAddress?: string;

  /** Additional metadata */
  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;
}
