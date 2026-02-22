import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { KycVerified } from '@/src/common/decorator/authenticate/rest/kyc-verified/kyc-verified.decorator';
import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { CreateMoneyOrderDTO } from '@/src/modules/money-order/dto/create-money-order.dto';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
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
  @Authenticate()
  @Authorize([Role.USER])
  @KycVerified()
  @ApiOperation({
    summary: 'Create a money order',
    description:
      'Initiate a new money order transaction. Requires authentication and USER role. Country code must be provided in x-country-code header.',
  })
  @ApiSecurity('JWT-auth')
  @ApiSecurity('x-country-code')
  @ApiResponse({
    status: 201,
    description: 'Money order initiated successfully',
    schema: {
      example: {
        success: true,
        message: 'Money order initiated successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - USER role required',
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
      userId: user.userId,
      receiverId: body.receiver,
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
