import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Mapper } from '@/src/common/util/mapper';
import {
  Body,
  Controller,
  Headers,
  Inject,
  Logger,
  Post,
  Req,
} from '@nestjs/common';
import { StripeService } from '../../service/stripe.service';
import { STRIPE_SERVICE } from '../../stripe.constant';
import { CreateIntentReqDTO } from './dto/create-intent-req.dto';

@Controller('stripe')
export class StripeController {
  logger = new Logger(StripeController.name);

  constructor(
    @Inject(STRIPE_SERVICE) private readonly stripeService: StripeService,
  ) {}

  @Post('/create-intent')
  @Authenticate()
  @Authorize([Role.USER])
  async createIntent(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @User() user: ReqUserPayload,
    @Body() body: CreateIntentReqDTO,
  ) {
    this.logger.log(
      `Received request to create payment intent from user ${user.id} in country ${countryCode} for amount ${body.amount} cents with idempotency key ${body.idempotencyKey}`,
    );

    const createIntentDTO = {
      amount: body.amount,
      idempotencyKey: body.idempotencyKey,
      supportedCurrency: Mapper.countryToCurrencyMap(countryCode),
    };

    await this.stripeService.createPaymentIntent(createIntentDTO);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Intent created successfully')
      .build();
  }

  @Post('webhook')
  async handleWebhook(
    @Req() req: Request,
    @Headers('stripe-signature') sig: string,
  ) {
    await this.stripeService.handleWebhook(req.body, sig);
    return { received: true };
  }
}
