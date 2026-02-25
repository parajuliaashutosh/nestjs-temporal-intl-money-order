import { StripeUserUpstream } from '../entity/stripe-user-upstream.entity';
import { StripeLogStatus, StripeOperationType } from '../enum/stripe-log.enum';

export interface StripeUserUpstreamRepoContract {
  create(data: Partial<StripeUserUpstream>): Promise<StripeUserUpstream | null>;
  findByStripeId(stripeId: string): Promise<StripeUserUpstream[]>;
  findByUserId(userId: string): Promise<StripeUserUpstream[]>;
  findByStatus(status: StripeLogStatus): Promise<StripeUserUpstream[]>;
  findByOperationType(
    operationType: StripeOperationType,
  ): Promise<StripeUserUpstream[]>;
  findByUserIdAndOperationType(
    userId: string,
    operationType: StripeOperationType,
  ): Promise<StripeUserUpstream[]>;
  updateStatus(
    id: string,
    status: StripeLogStatus,
  ): Promise<StripeUserUpstream | null>;
  update(
    id: string,
    data: Partial<StripeUserUpstream>,
  ): Promise<StripeUserUpstream | null>;
  delete(id: string): Promise<boolean>;
}
