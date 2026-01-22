import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
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
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
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
  @Authenticate()
  @Authorize([Role.SUDO_ADMIN, Role.SUPER_ADMIN, Role.ADMIN])
  @ApiOperation({
    summary: 'Create or update system configuration',
    description:
      'Create or update system configuration including exchange rates. Requires ADMIN role or higher. Country code must be provided in x-country-code header.',
  })
  @ApiSecurity('JWT-auth')
  @ApiSecurity('x-country-code')
  @ApiResponse({
    status: 201,
    description: 'System config created/updated successfully',
    schema: {
      example: {
        success: true,
        message: 'System config created/updated successfully',
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
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - ADMIN role or higher required',
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
  @ApiOperation({
    summary: 'Get system configuration',
    description:
      'Retrieve system configuration for a specific country. Country code must be provided in x-country-code header.',
  })
  @ApiSecurity('x-country-code')
  @ApiResponse({
    status: 200,
    description: 'System config fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'System config fetched successfully',
        data: {
          countryCode: 'US',
          currency: 'USD',
          exchangeRate: 1.0,
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Missing country code header',
  })
  @ApiResponse({
    status: 404,
    description: 'System config not found for the specified country',
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
