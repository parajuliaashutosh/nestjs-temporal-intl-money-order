import { StripeWebhookUpstream } from '../entity/stripe-webhook-upstream.entity';
import { StripeLogStatus } from '../enum/stripe-log.enum';

export interface StripeWebhookUpstreamRepoContract {
  create(
    data: Partial<StripeWebhookUpstream>,
  ): Promise<StripeWebhookUpstream | null>;
  findByStripeId(stripeId: string): Promise<StripeWebhookUpstream | null>;
  findByEventType(eventType: string): Promise<StripeWebhookUpstream[]>;
  findByStatus(status: StripeLogStatus): Promise<StripeWebhookUpstream[]>;
  findByUserId(userId: string): Promise<StripeWebhookUpstream[]>;
  updateStatus(
    id: string,
    status: StripeLogStatus,
  ): Promise<StripeWebhookUpstream | null>;
  update(
    id: string,
    data: Partial<StripeWebhookUpstream>,
  ): Promise<StripeWebhookUpstream | null>;
  delete(id: string): Promise<boolean>;
}
