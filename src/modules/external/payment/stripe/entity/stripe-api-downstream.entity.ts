import { Column, Entity, Index } from 'typeorm';
import { StripeLogStatus, StripeOperationType } from '../enum/stripe-log.enum';
import { StripeLogBase } from './stripe-base-entity/stripe-log-base.entity';

@Entity('stripe_downstream_log')
@Index(['idempotencyKey'], { unique: true })
export class StripeDownstreamLog extends StripeLogBase {
  @Column({ name: 'idempotency_key' })
  idempotencyKey: string;

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

  @Column({ type: 'jsonb', nullable: true, name: 'response_payload' })
  responsePayload?: Record<string, any>;

  @Column({ type: 'int', nullable: true, name: 'http_status_code' })
  httpStatusCode?: number;

  @Column({ type: 'int', nullable: true, name: 'processing_time_ms' })
  processingTimeMs?: number;
}
