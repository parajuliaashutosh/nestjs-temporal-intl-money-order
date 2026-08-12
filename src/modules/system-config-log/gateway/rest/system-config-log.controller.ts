import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { PaginatedData } from '@/src/common/response-type/pagination/paginated-data';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Controller, Get, HttpCode, HttpStatus, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { SystemConfigLogContract } from '../../contract/system-config-log.contract';
import { GetSystemConfigLogDTO } from '../../dto/get-system-config-log.dto';
import { SystemConfigLog } from '../../entity/system-config-log.entity';
import { SYSTEM_CONFIG_LOG_SERVICE } from '../../system-config-log.constant';
import { GetSystemConfigLogsReqDTO } from './dto/get-system-config-logs-req.dto';

@ApiTags('system-config-log')
@Controller('system-config-log')
export class SystemConfigLogController {
  constructor(
    @Inject(SYSTEM_CONFIG_LOG_SERVICE)
    private readonly systemConfigLogService: SystemConfigLogContract,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: 'Get system config change logs',
    description:
      'Fetch a paginated list of system configuration changes, including who changed them. Admin only.',
    authenticated: true,
    roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.SUDO_ADMIN],
    apiResponses: [
      {
        status: HttpStatus.OK,
        description: 'System config logs fetched successfully',
        type: () => RestResponse<PaginatedData<SystemConfigLog[]>>,
      },
    ],
  })
  async getSystemConfigLogs(@Query() query: GetSystemConfigLogsReqDTO) {
    const payload: GetSystemConfigLogDTO = {
      page: query.page,
      limit: query.limit,
      countryCode: query.countryCode,
    };

    const resp = await this.systemConfigLogService.getLogs(payload);

    const paginatedData = PaginatedData.builder<SystemConfigLog[]>()
      .setData(resp.data)
      .setCurrentPage(query.page)
      .setPerPage(query.limit)
      .setTotal(resp.count)
      .build();

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('System config logs fetched successfully')
      .setData(paginatedData)
      .build();
  }
}
