import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { PaginatedData } from '@/src/common/response-type/pagination/paginated-data';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Controller, Get, Inject, Param, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { UserContract } from '../../contract/user.contract';
import { USER_SERVICE } from '../../user.constant';
import { FilterUsersReqDTO } from './dto/filter-users-req.dto';

const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN, Role.SUDO_ADMIN];

@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(
    @Inject(USER_SERVICE)
    private readonly userService: UserContract,
  ) {}

  @Get('/')
  @RestEndpoint({
    summary: 'Filter users',
    description:
      'Paginated list of users filtered by search term, KYC status and country. Requires an admin role.',
    authenticated: true,
    roles: ADMIN_ROLES,
  })
  async filterUsers(@Query() query: FilterUsersReqDTO) {
    const { data, count } = await this.userService.filterUsers({
      page: query.page,
      limit: query.limit,
      skip: query.skip,
      search: query.search,
      authId: query.authId,
      kycStatus: query.kycStatus,
      country: query.country,
    });

    const paginated = PaginatedData.builder<typeof data>()
      .setData(data)
      .setTotal(count)
      .setCurrentPage(query.page)
      .setPerPage(query.limit)
      .build();

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Users fetched successfully')
      .setData(paginated)
      .build();
  }

  @Get('/:id')
  @RestEndpoint({
    summary: 'Get user detail',
    description:
      'Full detail of a single user including auth and wallet. Requires an admin role.',
    authenticated: true,
    roles: ADMIN_ROLES,
    apiParams: [{ name: 'id', description: 'User ID', example: 'uuid-here' }],
  })
  async getUser(@Param('id') id: string) {
    const user = await this.userService.getUserById(id);
    if (!user) throw AppException.notFound('USER_NOT_FOUND');

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User fetched successfully')
      .setData(user)
      .build();
  }
}
