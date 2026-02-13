import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Mapper } from '@/src/common/util/mapper';
import type { RawBodyRequest } from '@nestjs/common';
import {
  Body,
  Controller,
  Headers,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import {
  ApiBody,
  ApiHeader,
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { Request } from 'express';
import { CreateIntentDTO } from '../../dto/create-payment-intent.dto';
import { StripeService } from '../../service/stripe.service';
import { STRIPE_SERVICE } from '../../stripe.constant';
import { CreateIntentReqDTO } from './dto/create-intent-req.dto';

@ApiTags('stripe')
@Controller('stripe')
export class StripeController {
  private readonly logger = new Logger(StripeController.name);

  constructor(
    @Inject(STRIPE_SERVICE) private readonly stripeService: StripeService,
  ) {}

  @Post('/create-intent')
  @HttpCode(HttpStatus.CREATED)
  @Authenticate()
  @Authorize([Role.USER])
  @ApiOperation({
    summary: 'Create a payment intent',
    description:
      'Creates a Stripe payment intent for wallet top-up. Returns a client secret that must be used by the frontend to complete the payment using Stripe.js or Stripe Elements.',
  })
  @ApiSecurity('JWT-auth')
  @ApiSecurity('x-country-code')
  @ApiResponse({
    status: 201,
    description: 'Payment intent created successfully',
    schema: {
      example: {
        success: true,
        message: 'Payment intent created successfully',
        data: {
          clientSecret: 'pi_1234567890_secret_abcdef',
          paymentIntentId: 'pi_1234567890',
          amount: 1000,
          currency: 'usd',
          status: 'requires_payment_method',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid amount or missing required fields',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - USER role required',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error - Stripe API error',
  })
  async createIntent(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @User() user: ReqUserPayload,
    @Body() body: CreateIntentReqDTO,
  ) {
    this.logger.log(
      `Creating payment intent for user ${user.id} in country ${countryCode} for amount ${body.amount} cents`,
    );

    const createIntentDTO: CreateIntentDTO = {
      amount: body.amount,
      idempotencyKey: body.idempotencyKey,
      supportedCurrency: Mapper.countryToCurrencyMap(countryCode),
      userId: user.userId,
    };

    const resp = await this.stripeService.createPaymentIntent(createIntentDTO);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Payment intent created successfully')
      .setData(resp)
      .build();
  }

  @Post('/webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Stripe webhook endpoint',
    description:
      'Handles incoming Stripe webhook events. This endpoint is called by Stripe when payment events occur (e.g., payment succeeded, payment failed). The endpoint verifies the webhook signature before processing.',
  })
  @ApiHeader({
    name: 'stripe-signature',
    description: 'Stripe webhook signature for request verification',
    required: true,
  })
  @ApiBody({
    description: 'Raw Stripe webhook event payload',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', example: 'evt_1234567890' },
        type: { type: 'string', example: 'payment_intent.succeeded' },
        data: {
          type: 'object',
          properties: {
            object: { type: 'object' },
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Webhook processed successfully',
    schema: {
      example: {
        received: true,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid webhook signature or malformed payload',
  })
  async handleWebhook(
    @Req() req: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string,
  ) {
    this.logger.log('Received Stripe webhook');

    // Use rawBody for Stripe signature verification
    const rawBody = req.rawBody;

    if (!rawBody) {
      this.logger.error(
        'Raw body not available for webhook signature verification',
      );
      throw AppException.badRequest('Invalid request body');
    }

    // Extract IP address for logging
    const ipAddress =
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.ip ??
      req.socket?.remoteAddress;

    await this.stripeService.handleWebhook(rawBody, signature, ipAddress);

    return { received: true };
  }
}
