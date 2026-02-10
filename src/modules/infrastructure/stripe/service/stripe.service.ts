import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateIntentDTO } from '../dto/create-payment-intent.dto';

@Injectable()
export class StripeService {
  private readonly log = new Logger(StripeService.name);
  constructor(
    @Inject('STRIPE') private stripe: Stripe,
    private readonly configService: ConfigService,
  ) {}

  //   note amount is in cents, so $10 would be 1000
  async createPaymentIntent(payload: CreateIntentDTO) {
    const { amount, supportedCurrency } = payload;
    this.log.log(`Creating payment intent for amount: ${amount} cents`);

    const paymentIntentCreateParams: Stripe.PaymentIntentCreateParams = {
      amount: amount,
      currency: supportedCurrency.toLowerCase(),
      error_on_requires_action: true,
      automatic_payment_methods: { enabled: true },
    };

    const requestOptions: Stripe.RequestOptions = {
      idempotencyKey: payload.idempotencyKey,
    };

    return this.stripe.paymentIntents.create(
      paymentIntentCreateParams,
      requestOptions,
    );
  }

  async handleWebhook(body: string, sig: string) {
    const event = this.stripe.webhooks.constructEvent(
      body,
      sig,
      this.configService.getOrThrow<string>('STRIPE_WEBHOOK_SECRET'),
    );

    if (event.type === 'payment_intent.succeeded') {
      const intent = event.data.object;
      console.log('🚀 ~ StripeService ~ handleWebhook ~ intent:', intent);

      // ✅ CREDIT WALLET HERE
      // intent.amount / 100
    }

    return true;
  }
}
