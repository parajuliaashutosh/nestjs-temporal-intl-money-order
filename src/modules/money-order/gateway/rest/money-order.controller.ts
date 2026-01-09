import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import { CreateMoneyOrderDTO } from '../../dto/create-money-order.dto';
import { MONEY_ORDER_FACTORY } from '../../money-order.constant';
import { MoneyOrderFactory } from '../../service/money-order.factory';
import { CreateMoneyOrderReqDTO } from './dto/create-money-order-req.dto';

@Controller('money-order')
export class MoneyOrderController {
  constructor(
    @Inject(MONEY_ORDER_FACTORY) private readonly moneyOrderFactory: MoneyOrderFactory,
    // private readonly temporalClient: TemporalClientService,
  ) {}

  // TODO: a web hook guard to be added here
  @Post('/')
  async updateBalanceWebhook(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @User() user: ReqUserPayload,
    @Body() body: CreateMoneyOrderReqDTO,
  ) {
    const moneyOrderService = this.moneyOrderFactory.getMoneyOrderService(countryCode);
    
    const payload: CreateMoneyOrderDTO = {
        sendingAmount: body.sendingAmount,
        receiverAmount: body.receiverAmount,
        exchangeRate: body.exchangeRate,
        userId: user.userId,
        receiverId: body.receiverId,
    };

    await moneyOrderService.createMoneyOrder(payload);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Wallet topped up successfully')
      .build();
  }

  // @Post('update-complex-balance')
  // async updateBalance(@Body() body: { userId: string; amount: number }) {
  //   console.log("🚀 ~ WalletController ~ updateBalance ~ body:", body);
  //   const handle = await this.temporalClient.startWorkflow(
  //     'updateWalletWorkflow', // 👈 WORKFLOW NAME
  //     [body.userId, body.amount],
  //     'wallet-task-queue', // 👈 TASK QUEUE NAME
  //   );

  //   return {
  //     message: 'Workflow triggered',
  //     workflowId: handle.workflowId,
  //     runId: handle?.workflowId,
  //   };
  // }
}
