import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Mapper } from '@/src/common/util/mapper';
import type { WalletContract } from '@/src/modules/wallet/contract/wallet.contract';
import { WalletTopUpDTO } from '@/src/modules/wallet/dto/wallet-topup.dto';
import { WALLET_SERVICE } from '@/src/modules/wallet/wallet.constant';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import { CreateIntentDTO } from '../dto/create-payment-intent.dto';
import { STRIPE } from '../stripe.constant';

export interface PaymentIntentResponse {
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
  status: string;
}

@Injectable()
export class StripeService {
  private readonly log = new Logger(StripeService.name);

  constructor(
    @Inject(STRIPE) private readonly stripe: Stripe,
    private readonly configService: ConfigService,
    @Inject(WALLET_SERVICE) private readonly walletService: WalletContract,
  ) {}

  /**
   * Creates a Stripe payment intent for wallet top-up
   * @param payload - Payment intent creation data including amount in cents
   * @returns PaymentIntentResponse with client secret for frontend confirmation
   * @throws AppException on Stripe API errors
   */
  async createPaymentIntent(
    payload: CreateIntentDTO,
  ): Promise<PaymentIntentResponse> {
    const { amount, supportedCurrency, idempotencyKey } = payload;

    this.log.log(
      `Creating payment intent for amount: ${amount} cents in ${supportedCurrency}`,
    );

    try {
      const paymentIntentCreateParams: Stripe.PaymentIntentCreateParams = {
        amount: amount,
        currency: supportedCurrency.toLowerCase(),
        automatic_payment_methods: { enabled: true },
        metadata: {
          idempotencyKey: idempotencyKey,
          userId: payload?.userId,
        },
      };

      const requestOptions: Stripe.RequestOptions = {
        idempotencyKey: idempotencyKey,
      };

      const paymentIntent = await this.stripe.paymentIntents.create(
        paymentIntentCreateParams,
        requestOptions,
      );

      this.log.log(`Payment intent created successfully: ${paymentIntent.id}`);

      return {
        clientSecret: paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      this.log.error(`Failed to create payment intent: ${error}`);

      if (error instanceof Stripe.errors.StripeError) {
        switch (error.type) {
          case 'StripeCardError':
            throw AppException.badRequest(`Card error: ${error.message}`);
          case 'StripeRateLimitError':
            throw AppException.internalServerError(
              'Too many requests to payment service. Please try again.',
            );
          case 'StripeInvalidRequestError':
            throw AppException.badRequest(
              `Invalid payment request: ${error.message}`,
            );
          case 'StripeAPIError':
            throw AppException.internalServerError(
              'Payment service temporarily unavailable.',
            );
          case 'StripeConnectionError':
            throw AppException.internalServerError(
              'Unable to connect to payment service.',
            );
          case 'StripeAuthenticationError':
            throw AppException.internalServerError(
              'Payment service authentication failed.',
            );
          default:
            throw AppException.internalServerError(
              'An error occurred while processing payment.',
            );
        }
      }

      throw AppException.internalServerError(
        'An unexpected error occurred while processing payment.',
      );
    }
  }

  /**
   * Handles incoming Stripe webhook events
   * @param rawBody - Raw request body as Buffer for signature verification
   * @param signature - Stripe webhook signature from headers
   * @returns true if webhook was processed successfully
   * @throws AppException on signature verification failure or processing errors
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<boolean> {
    let event: Stripe.Event;

    try {
      const webhookSecret = this.configService.getOrThrow<string>(
        'STRIPE_WEBHOOK_SECRET',
      );

      event = this.stripe.webhooks.constructEvent(
        rawBody,
        signature,
        webhookSecret,
      );
    } catch (error) {
      this.log.error(`Webhook signature verification failed: ${error}`);
      throw AppException.badRequest('Invalid webhook signature');
    }

    this.log.log(`Received webhook event: ${event.type} (${event.id})`);

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object);
          break;
        case 'payment_intent.payment_failed':
          this.handlePaymentIntentFailed(event.data.object);
          break;
        default:
          this.log.log(`Unhandled event type: ${event.type}`);
      }
    } catch (error) {
      this.log.error(`Error processing webhook event ${event.type}: ${error}`);
      throw error;
    }

    return true;
  }

  /**
   * Handles successful payment intent events
   */
  private async handlePaymentIntentSucceeded(
    paymentIntent: Stripe.PaymentIntent,
  ): Promise<void> {
    this.log.log(`Processing successful payment: ${paymentIntent.id}`);

    const userId = paymentIntent.metadata?.userId;

    if (!userId) {
      this.log.error(
        `Payment intent ${paymentIntent.id} missing userId in metadata`,
      );
      throw AppException.badRequest('Missing userId in payment metadata');
    }

    const walletTopUpDTO: WalletTopUpDTO = {
      id: paymentIntent.id, // Using payment intent ID for idempotency
      userId: userId,
      amount: paymentIntent.amount, // Amount in cents
      country: Mapper.currencyToCountryMap(
        paymentIntent.currency.toUpperCase() as SupportedCurrency,
      ),
    };

    await this.walletService.walletTopUp(walletTopUpDTO);

    this.log.log(
      `Wallet topped up successfully for user ${userId}, amount: ${paymentIntent.amount} cents`,
    );
  }

  /**
   * Handles failed payment intent events
   */
  private handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): void {
    this.log.warn(
      `Payment failed: ${paymentIntent.id}, ` +
        `reason: ${paymentIntent.last_payment_error?.message ?? 'Unknown'}`,
    );

    // TODO: Implement notification to user about failed payment
    // TODO: Consider storing failed payment attempts for analytics
  }
}
