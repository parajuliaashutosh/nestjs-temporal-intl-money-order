import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { WalletContract } from '../../contract/wallet.contract';
import { WalletTopUpDTO } from '../../dto/wallet-topup.dto';
import { WALLET_SERVICE } from '../../wallet.constant';
import { WalletTopUpReqDTO } from './dto/wallet-topup-req.dto';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(
    @Inject(WALLET_SERVICE) private readonly walletService: WalletContract,
  ) {}

  // TODO: a web hook guard to be added here
  @Post('/update-balance')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update wallet balance (Webhook)',
    description:
      'Update user wallet balance via webhook. This endpoint should be called by payment gateway webhooks. Country code must be provided in x-country-code header.',
  })
  @ApiSecurity('x-country-code')
  @ApiResponse({
    status: 200,
    description: 'Wallet topped up successfully',
    schema: {
      example: {
        success: true,
        message: 'Wallet topped up successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Invalid input data or missing country code header',
  })
  @ApiResponse({
    status: 404,
    description: 'User or wallet not found',
  })
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
}
