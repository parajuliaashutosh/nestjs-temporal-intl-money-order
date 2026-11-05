import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Logger,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { WalletContract } from '../../contract/wallet.contract';
import { WalletTopUpDTO } from '../../dto/wallet-topup.dto';
import { WALLET_SERVICE } from '../../wallet.constant';
import { WalletTopUpReqDTO } from './dto/wallet-topup-req.dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  private readonly logger = new Logger(WalletController.name);

  constructor(
    @Inject(WALLET_SERVICE) private readonly walletService: WalletContract,
  ) {}

  @Post('/dev-topup')
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: '[Non-production only] Manually top up a wallet',
    description:
      'Simulates a Stripe payment_intent.succeeded webhook so wallets can be topped up locally without a live Stripe webhook secret (which rotates every time `stripe listen` restarts). ' +
      "The `id` field doubles as the idempotency key - replaying the same id is a no-op and returns the wallet's existing state.",
    devOnly: true,
    preSigned: true,
  })
  async devTopUp(@Body() body: WalletTopUpReqDTO) {
    this.logger.log(`[DEV] Manual wallet top-up requested: ${body.id}`);

    const walletTopUpDTO: WalletTopUpDTO = {
      id: body.id,
      userId: body.userId,
      country: body.country,
      amount: body.amount,
    };

    const wallet = await this.walletService.walletTopUp(walletTopUpDTO);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Wallet topped up successfully')
      .setData(wallet)
      .build();
  }
}
