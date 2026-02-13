import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Stripe } from 'stripe';
import { AuthModule } from '../../auth/auth.module';
import { WalletModule } from '../../wallet/wallet.module';
import { StripeLog } from './entity/stripe-log.entity';
import { StripeController } from './gateway/rest/stripe.controller';
import { StripeService } from './service/stripe.service';
import { STRIPE, STRIPE_SERVICE } from './stripe.constant';

@Module({
  imports: [TypeOrmModule.forFeature([StripeLog]), WalletModule, AuthModule],
  providers: [
    {
      provide: STRIPE,
      useFactory: (configService: ConfigService) => {
        const stripeSecretKey = configService.get<string>('STRIPE_SECRET_KEY');
        return new Stripe(stripeSecretKey, {
          apiVersion: '2026-01-28.clover',
        });
      },
      inject: [ConfigService],
    },
    {
      provide: STRIPE_SERVICE,
      useClass: StripeService,
    },
  ],
  controllers: [StripeController],
  exports: [],
})
export class StripeModule {}
