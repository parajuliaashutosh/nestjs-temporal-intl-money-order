import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { Role } from '@/src/common/enum/role.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { PaginatedData } from '@/src/common/response-type/pagination/paginated-data';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import {
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  ParseIntPipe,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { LoginLogContract } from '../../contract/login-log.contract';
import { GetLoginLogDTO } from '../../dto/get-login-log.dto';
import { LoginLog } from '../../entity/login-log.entity';
import { LOGIN_LOG_SERVICE } from '../../login-log.constant';

@ApiTags('login-log')
@Controller('login-log')
export class LoginLogController {
  constructor(
    @Inject(LOGIN_LOG_SERVICE)
    private readonly loginLogService: LoginLogContract,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: 'Get login logs',
    description:
      'Fetch a paginated list of login logs for the authenticated user. Supports optional search query.',
    authenticated: true,
    roles: [Role.USER],
    apiResponses: [
      {
        status: HttpStatus.OK,
        description: 'Login logs fetched successfully',
        type: () => RestResponse<PaginatedData<LoginLog[]>>,
      },
    ],
  })
  async getLoginLogs(
    @User() user: ReqUserPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('search') search?: string,
  ) {
    const payload: GetLoginLogDTO = {
      authId: user.id,
      page,
      limit: perPage,
      search,
    };

    const resp = await this.loginLogService.getLoginLogsByAuthId(payload);

    const paginatedData = PaginatedData.builder<LoginLog[]>()
      .setData(resp.data)
      .setCurrentPage(page)
      .setPerPage(perPage)
      .setTotal(resp.count)
      .build();

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Login logs fetched successfully')
      .setData(paginatedData)
      .build();
  }
}
