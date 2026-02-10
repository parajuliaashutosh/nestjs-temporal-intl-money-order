import { Inject, Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly log = new Logger(StripeService.name);
  constructor(@Inject('STRIPE') private stripe: Stripe) {}

  //   note amount is in cents, so $10 would be 1000
  async createPaymentIntent(amount: number) {
    this.log.log(`Creating payment intent for amount: ${amount} cents`);

    const paymentIntentCreateParams: Stripe.PaymentIntentCreateParams = {
      amount: amount,
      currency: 'usd',
      error_on_requires_action: true,
      automatic_payment_methods: { enabled: true },
    };

    const requestOptions: Stripe.RequestOptions = {
      // You can specify additional request options here if needed
    };

    return this.stripe.paymentIntents.create(
      paymentIntentCreateParams,
      requestOptions,
    );
  }
}
