import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Query } from '@nestjs/common';
import type { SystemConfigContract } from '../../contract/system-config.contract';
import { CreateSystemConfigDTO } from '../../dto/create-system-config.dto';
import { SYSTEM_CONFIG_SERVICE } from '../../system-config.constant';

@Controller('system-config')
export class SystemConfigController {
  constructor(
    @Inject(SYSTEM_CONFIG_SERVICE)
    private readonly systemConfigService: SystemConfigContract,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Authenticate()
  @Authorize([Role.SUDO_ADMIN, Role.SUPER_ADMIN, Role.ADMIN])
  async register(@Body() data: CreateSystemConfigDTO) {
    const payload: CreateSystemConfigDTO = {
        countryCode: data.countryCode,
        currency: data.currency,
        exchangeRate: data.exchangeRate,
    };

    const resp = await this.systemConfigService.createOrUpdateSystemConfig(payload);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('System config created/updated successfully')
      .setData(resp)
      .build();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getSystemConfig(@Query('countryCode') countryCode: string) {
    const resp = await this.systemConfigService.getSystemConfigByKey(countryCode);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('System config fetched successfully')
      .setData(resp)
      .build();
  }
}
