import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { WalletContract } from '../../contract/wallet.contract';
import { WalletTopUpDTO } from '../../dto/wallet-topup.dto';
import { WALLET_SERVICE } from '../../wallet.constant';
import { WalletTopUpReqDTO } from './dto/wallet-topup-req.dto';

@Controller()
export class WalletController {
  constructor(
    @Inject(WALLET_SERVICE) private readonly walletService: WalletContract,
    // private readonly temporalClient: TemporalClientService,
  ) {}

  // TODO: a web hook guard to be added here
  @Post('/update-balance')
  async updateBalanceWebhook(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @Body() body: WalletTopUpReqDTO,
  ) {
    const payload: WalletTopUpDTO = {
      id: body.id,
      userId: body.userId,
      country: countryCode,
      amount: body.amount,
    };
    await this.walletService.walletTopUp(payload);
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
