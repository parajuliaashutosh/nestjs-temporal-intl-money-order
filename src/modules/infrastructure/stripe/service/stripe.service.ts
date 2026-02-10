import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { Mapper } from '@/src/common/util/mapper';
import type { WalletContract } from '@/src/modules/wallet/contract/wallet.contract';
import { WalletTopUpDTO } from '@/src/modules/wallet/dto/wallet-topup.dto';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateIntentDTO } from '../dto/create-payment-intent.dto';
import { STRIPE_SERVICE } from '../stripe.constant';

@Injectable()
export class StripeService {
  private readonly log = new Logger(StripeService.name);
  constructor(
    @Inject(STRIPE_SERVICE) private stripe: Stripe,
    private readonly configService: ConfigService,
    private readonly walletService: WalletContract,
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

      const walletTopUpDTO: WalletTopUpDTO = {
        // idempotency is handled in wallet service
        id: intent.id,
        userId: intent.metadata.userId,
        amount: intent.amount, // amount in cents
        country: Mapper.currencyToCountryMap(
          intent.currency.toUpperCase() as SupportedCurrency,
        ),
      };
      await this.walletService.walletTopUp(walletTopUpDTO);
    }

    return true;
  }
}
