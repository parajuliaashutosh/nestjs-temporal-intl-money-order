import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { STRIPE_CLIENT } from './stripe-client.constant';

@Module({
  providers: [
    {
      provide: STRIPE_CLIENT,
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');
        return new Stripe(stripeSecretKey, {
          apiVersion: '2026-01-28.clover',
        });
      },
      inject: [ConfigService],
    },
  ],
  exports: [STRIPE_CLIENT],
})
export class StripeClientModule {}
