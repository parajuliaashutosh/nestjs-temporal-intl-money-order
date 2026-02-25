import { StripeDownstreamLog } from '../entity/stripe-api-downstream.entity';
import { StripeLogStatus, StripeOperationType } from '../enum/stripe-log.enum';

export interface StripeDownstreamRepoContract {
  create(
    data: Partial<StripeDownstreamLog>,
  ): Promise<StripeDownstreamLog | null>;
  findByIdempotencyKey(
    idempotencyKey: string,
  ): Promise<StripeDownstreamLog | null>;
  findByStripeId(stripeId: string): Promise<StripeDownstreamLog[]>;
  findByUserId(userId: string): Promise<StripeDownstreamLog[]>;
  findByStatus(status: StripeLogStatus): Promise<StripeDownstreamLog[]>;
  findByOperationType(
    operationType: StripeOperationType,
  ): Promise<StripeDownstreamLog[]>;
  updateStatus(
    id: string,
    status: StripeLogStatus,
  ): Promise<StripeDownstreamLog | null>;
  update(
    id: string,
    data: Partial<StripeDownstreamLog>,
  ): Promise<StripeDownstreamLog | null>;
  delete(id: string): Promise<boolean>;
}
