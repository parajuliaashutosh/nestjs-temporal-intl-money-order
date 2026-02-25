import { AuthModule } from '@/src/modules/auth/auth.module';
import { WalletModule } from '@/src/modules/wallet/wallet.module';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StripeClientModule } from '../../stripe-client/stripe-client.module';
import { StripeDownstreamLog } from './entity/stripe-api-downstream.entity';
import { StripeUserUpstream } from './entity/stripe-user-upstream.entity';
import { StripeWebhookUpstream } from './entity/stripe-webhook-upstream.entity';
import { StripeController } from './gateway/rest/stripe.controller';
import { StripeDownstreamRepo } from './repo/stripe-downstream.repo';
import { StripeUserUpstreamRepo } from './repo/stripe-user-upstream.repo';
import { StripeWebhookUpstreamRepo } from './repo/stripe-webhook-upstream.repo';
import { StripeService } from './service/stripe.service';
import {
  STRIPE_DOWNSTREAM_REPO,
  STRIPE_SERVICE,
  STRIPE_USER_UPSTREAM_REPO,
  STRIPE_WEBHOOK_UPSTREAM_REPO,
} from './stripe.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StripeDownstreamLog,
      StripeUserUpstream,
      StripeWebhookUpstream,
    ]),
    WalletModule,
    AuthModule,
    StripeClientModule,
  ],
  providers: [
    {
      provide: STRIPE_SERVICE,
      useClass: StripeService,
    },
    {
      provide: STRIPE_DOWNSTREAM_REPO,
      useClass: StripeDownstreamRepo,
    },
    {
      provide: STRIPE_USER_UPSTREAM_REPO,
      useClass: StripeUserUpstreamRepo,
    },
    {
      provide: STRIPE_WEBHOOK_UPSTREAM_REPO,
      useClass: StripeWebhookUpstreamRepo,
    },
  ],
  controllers: [StripeController],
  exports: [
    STRIPE_DOWNSTREAM_REPO,
    STRIPE_USER_UPSTREAM_REPO,
    STRIPE_WEBHOOK_UPSTREAM_REPO,
  ],
})
export class StripeModule {}
