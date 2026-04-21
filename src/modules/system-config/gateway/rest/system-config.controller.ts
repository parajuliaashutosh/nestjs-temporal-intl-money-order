import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  Post,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { SystemConfigContract } from '../../contract/system-config.contract';
import { CreateSystemConfigDTO } from '../../dto/create-system-config.dto';
import { SYSTEM_CONFIG_SERVICE } from '../../system-config.constant';
import { CreateSystemConfigReqDTO } from './dto/create-system-config-req.dto';

@ApiTags('system-config')
@Controller('system-config')
export class SystemConfigController {
  constructor(
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: SystemConfigContract,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RestEndpoint({
    summary: 'Create or update system configuration',
    description:
      'Create or update the system configuration for a specific country.',
    authenticated: true,
    roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.SUDO_ADMIN],
  })
  async register(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @Body() data: CreateSystemConfigReqDTO,
  ) {
    const payload: CreateSystemConfigDTO = {
      countryCode: countryCode,
      currency: data.currency,
      exchangeRate: data.exchangeRate,
    };

    await this.systemConfigService.createOrUpdateSystemConfig(payload);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('System config created/updated successfully')
      .build();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: 'Get system configuration',
    description:
      'Fetch the system configuration for the specified country. Country code must be provided in x-country-code header.',
  })
  async getSystemConfig(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
  ) {
    const resp =
      await this.systemConfigService.getSystemConfigByKey(countryCode);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('System config fetched successfully')
      .setData(resp)
      .build();
  }
}
