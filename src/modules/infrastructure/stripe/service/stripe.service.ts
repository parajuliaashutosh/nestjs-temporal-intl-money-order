import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Mapper } from '@/src/common/util/mapper';
import type { WalletContract } from '@/src/modules/wallet/contract/wallet.contract';
import { WalletTopUpDTO } from '@/src/modules/wallet/dto/wallet-topup.dto';
import { WALLET_SERVICE } from '@/src/modules/wallet/wallet.constant';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Stripe from 'stripe';
import type { StripeDownstreamRepoContract } from '../contract/stripe-downstream.repo.contract';
import type { StripeUserUpstreamRepoContract } from '../contract/stripe-user-upstream.repo.contract';
import type { StripeWebhookUpstreamRepoContract } from '../contract/stripe-webhook-upstream.repo.contract';
import { CreateIntentDTO } from '../dto/create-payment-intent.dto';
import { StripeLogStatus, StripeOperationType } from '../enum/stripe-log.enum';
import {
  STRIPE,
  STRIPE_DOWNSTREAM_REPO,
  STRIPE_USER_UPSTREAM_REPO,
  STRIPE_WEBHOOK_UPSTREAM_REPO,
} from '../stripe.constant';

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
    @Inject(STRIPE_DOWNSTREAM_REPO)
    private readonly stripeDownstreamRepo: StripeDownstreamRepoContract,
    @Inject(STRIPE_USER_UPSTREAM_REPO)
    private readonly stripeUserUpstreamRepo: StripeUserUpstreamRepoContract,
    @Inject(STRIPE_WEBHOOK_UPSTREAM_REPO)
    private readonly stripeWebhookUpstreamRepo: StripeWebhookUpstreamRepoContract,
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
    this.log.log(`Creating payment intent for amount:`, payload);

    const requestPayload: Stripe.PaymentIntentCreateParams = {
      amount: payload.amount,
      currency: payload.supportedCurrency.toLowerCase(),
      // automatic_payment_methods: { enabled: true },
      payment_method_types: ['card'],
      metadata: {
        idempotencyKey: payload.idempotencyKey,
        userId: payload?.userId,
      },
    };

    try {
      const requestOptions: Stripe.RequestOptions = {
        idempotencyKey: payload.idempotencyKey,
      };

      // Check if we already processed this idempotency key for this user
      const alreadyExist = await this.stripeDownstreamRepo.findByIdempotencyKey(
        payload.idempotencyKey,
      );

      if (alreadyExist && alreadyExist.userId === payload?.userId) {
        return {
          clientSecret:
            (alreadyExist.responsePayload?.clientSecret as string) ?? '',
          paymentIntentId: alreadyExist.stripeId || '',
          amount: alreadyExist.amount || 0,
          currency: alreadyExist.currency || '',
          status: (alreadyExist.responsePayload?.status as string) || 'unknown',
        };
      }

      const paymentIntent = await this.stripe.paymentIntents.create(
        requestPayload,
        requestOptions,
      );

      this.log.log(`Payment intent created successfully: ${paymentIntent.id}`);

      // Log successful upstream request to downstream repo (as it's an API call)
      await this.stripeDownstreamRepo.create({
        idempotencyKey: payload.idempotencyKey,
        operationType: StripeOperationType.PAYMENT_INTENT_CREATE,
        status: StripeLogStatus.SUCCESS,
        stripeId: paymentIntent.id,
        userId: payload?.userId,
        amount: payload.amount,
        currency: payload.supportedCurrency.toLowerCase(),
        requestPayload: requestPayload as unknown as Record<string, unknown>,
        responsePayload: {
          id: paymentIntent.id,
          status: paymentIntent.status,
          amount: paymentIntent.amount,
          currency: paymentIntent.currency,
          clientSecret: paymentIntent.client_secret,
          ...paymentIntent,
        },
        httpStatusCode: 200,
      });

      return {
        clientSecret: paymentIntent.client_secret ?? '',
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status,
      };
    } catch (error) {
      this.log.error(`Failed to create payment intent: ${error}`);

      // Log failed upstream request
      const errorDetails = this.extractStripeError(error);
      await this.stripeDownstreamRepo.create({
        idempotencyKey: payload.idempotencyKey,
        operationType: StripeOperationType.PAYMENT_INTENT_CREATE,
        status: StripeLogStatus.FAILED,
        userId: payload?.userId,
        amount: payload.amount,
        currency: payload.supportedCurrency.toLowerCase(),
        requestPayload: requestPayload as unknown as Record<string, unknown>,
        errorMessage: errorDetails.message,
        errorCode: errorDetails.code,
        errorType: errorDetails.type,
        httpStatusCode: errorDetails.statusCode,
      });

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
   * @param ipAddress - IP address of the webhook request
   * @returns true if webhook was processed successfully
   * @throws AppException on signature verification failure or processing errors
   */
  async handleWebhook(
    rawBody: Buffer,
    signature: string,
    ipAddress?: string,
  ): Promise<boolean> {
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

      // Log failed webhook verification
      await this.stripeWebhookUpstreamRepo.create({
        eventType: 'unknown',
        status: StripeLogStatus.FAILED,
        errorMessage: 'Webhook signature verification failed',
        webhookSignature: signature?.substring(0, 50), // Store partial signature for debugging
        ipAddress,
        payload: {},
      });

      throw AppException.badRequest('Invalid webhook signature');
    }

    this.log.log(`Received webhook event: ${event.type} (${event.id})`);

    const paymentIntent = event.data.object as Stripe.PaymentIntent;

    try {
      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(paymentIntent);
          break;
        case 'payment_intent.payment_failed':
          this.handlePaymentIntentFailed(paymentIntent);
          break;
        case 'payment_intent.created':
          this.handlePaymentIntentCreated(paymentIntent);
          break;
        default:
          this.log.log(`Unhandled event type: ${event.type}`);
      }

      // Log successful webhook processing
      await this.stripeWebhookUpstreamRepo.create({
        eventType: event.type,
        status: StripeLogStatus.SUCCESS,
        stripeId: event.id,
        userId: paymentIntent?.metadata?.userId,
        amount: paymentIntent?.amount,
        currency: paymentIntent?.currency,
        payload: {
          eventType: event.type,
          eventId: event.id,
          paymentIntentId: paymentIntent?.id,
          paymentIntentStatus: paymentIntent?.status,
        },
        webhookSignature: signature?.substring(0, 50),
        ipAddress,
      });
    } catch (error) {
      this.log.error(`Error processing webhook event ${event.type}: ${error}`);

      // Log failed webhook processing
      const errorDetails = this.extractStripeError(error);
      await this.stripeWebhookUpstreamRepo.create({
        eventType: event.type,
        status: StripeLogStatus.FAILED,
        stripeId: event.id,
        userId: paymentIntent?.metadata?.userId,
        amount: paymentIntent?.amount,
        currency: paymentIntent?.currency,
        payload: {
          eventType: event.type,
          eventId: event.id,
          paymentIntentId: paymentIntent?.id,
        },
        errorMessage: errorDetails.message,
        errorCode: errorDetails.code,
        webhookSignature: signature?.substring(0, 50),
        ipAddress,
      });

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
    this.log.log(
      `Processing successful payment: ${paymentIntent.id}`,
      paymentIntent,
    );

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

    // Log is already handled in the webhook handler
    // Additional notification logic can be added here
  }

  private handlePaymentIntentCreated(
    paymentIntent: Stripe.PaymentIntent,
  ): void {
    this.log.log(`Payment intent created: ${paymentIntent.id}`);
    // Log is already handled in the webhook handler
    // Additional notification logic can be added here
  }

  /**
   * Maps Stripe webhook event type to our operation type enum
   */
  private mapWebhookEventToOperationType(
    eventType: string,
  ): StripeOperationType {
    const eventMap: Record<string, StripeOperationType> = {
      'payment_intent.succeeded':
        StripeOperationType.WEBHOOK_PAYMENT_INTENT_SUCCEEDED,
      'payment_intent.payment_failed':
        StripeOperationType.WEBHOOK_PAYMENT_INTENT_FAILED,
      'payment_intent.canceled':
        StripeOperationType.WEBHOOK_PAYMENT_INTENT_CANCELED,
      'charge.succeeded': StripeOperationType.WEBHOOK_CHARGE_SUCCEEDED,
      'charge.failed': StripeOperationType.WEBHOOK_CHARGE_FAILED,
      'refund.created': StripeOperationType.WEBHOOK_REFUND_CREATED,
    };

    return eventMap[eventType] ?? StripeOperationType.WEBHOOK_UNKNOWN;
  }

  /**
   * Extracts error details from various error types
   */
  private extractStripeError(error: unknown): {
    message: string;
    code?: string;
    type?: string;
    statusCode?: number;
  } {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        message: error.message,
        code: error.code,
        type: error.type,
        statusCode: error.statusCode,
      };
    }

    if (error instanceof Error) {
      return {
        message: error.message,
      };
    }

    return {
      message: 'Unknown error',
    };
  }
}
