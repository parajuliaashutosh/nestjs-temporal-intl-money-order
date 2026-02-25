import { Module } from '@nestjs/common';
import { StripeClientModule } from '../../stripe-client/stripe-client.module';

@Module({
  imports: [StripeClientModule],
})
export class StripeIdentityModule {}
