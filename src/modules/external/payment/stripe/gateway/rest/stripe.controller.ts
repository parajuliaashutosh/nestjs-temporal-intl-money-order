import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
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
import { ApiTags } from '@nestjs/swagger';
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
  @RestEndpoint({
    summary: 'Create a Stripe payment intent',
    description:
      'Creates a Stripe payment intent for the authenticated user. Requires USER role and KYC verification. Country code must be provided in x-country-code header.',
    authenticated: true,
    roles: [Role.USER],
    kycVerified: true,
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
      userId: user.user.userId,
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
  @RestEndpoint({
    summary: 'Handle Stripe webhook events',
    description:
      'Endpoint to receive and handle Stripe webhook events. This endpoint is used by Stripe to send event notifications. It verifies the Stripe signature and processes the event accordingly.',
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
