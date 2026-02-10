import { Module } from '@nestjs/common';
import { StripeService } from './service/stripe.service';

@Module({
  providers: [StripeService]
})
export class StripeModule {}
