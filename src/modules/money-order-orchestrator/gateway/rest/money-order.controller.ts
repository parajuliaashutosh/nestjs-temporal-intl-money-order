import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { CreateMoneyOrderDTO } from '@/src/modules/money-order/dto/create-money-order.dto';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MONEY_ORDER_ORCHESTRATOR_SERVICE } from '../../money-order-orchestrator.constant';
import { MoneyOrderOrchestratorService } from '../../service/money-order-orchestrator.service';
import { CreateMoneyOrderReqDTO } from './dto/create-money-order-req.dto';

@ApiTags('money-order')
@Controller('money-order')
export class MoneyOrderController {
  constructor(
    @Inject(MONEY_ORDER_ORCHESTRATOR_SERVICE)
    private readonly moneyOrderOrchestratorService: MoneyOrderOrchestratorService,
  ) {}

  @Post('/')
  @RestEndpoint({
    summary: 'Create a money order',
    description:
      'Initiate a money order to send funds to another user. Requires USER role and KYC verification. Country code must be provided in x-country-code header.',
    authenticated: true,
    roles: [Role.USER],
    kycVerified: true,
  })
  async createMoneyOrder(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @User() user: ReqUserPayload,
    @Body() body: CreateMoneyOrderReqDTO,
  ) {
    const payload: CreateMoneyOrderDTO = {
      sendingAmount: body.sendingAmount,
      receiverAmount: body.receiverAmount,
      exchangeRate: body.exchangeRate,
      userId: user.user.userId,
      receiverId: body.receiver,
      idempotentId: body.idempotentId,
    };
    await this.moneyOrderOrchestratorService.createMoneyOrder(
      payload,
      countryCode,
    );

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Money order initiated successfully')
      .build();
  }
}
