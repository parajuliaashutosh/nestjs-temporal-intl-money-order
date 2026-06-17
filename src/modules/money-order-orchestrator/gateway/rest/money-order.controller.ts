import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { PaginatedData } from '@/src/common/response-type/pagination/paginated-data';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { CreateMoneyOrderDTO } from '@/src/modules/money-order/dto/create-money-order.dto';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { MONEY_ORDER_ORCHESTRATOR_SERVICE } from '../../money-order-orchestrator.constant';
import { MoneyOrderOrchestratorService } from '../../service/money-order-orchestrator.service';
import { CreateMoneyOrderReqDTO } from './dto/create-money-order-req.dto';
import { FilterMoneyOrdersReqDTO } from './dto/filter-money-orders-req.dto';

const ADMIN_ROLES = [Role.ADMIN, Role.SUPER_ADMIN, Role.SUDO_ADMIN];

@ApiTags('money-order')
@Controller('money-order')
export class MoneyOrderController {
  constructor(
    @Inject(MONEY_ORDER_ORCHESTRATOR_SERVICE)
    private readonly moneyOrderOrchestratorService: MoneyOrderOrchestratorService,
  ) {}

  @Post('/')
  @RestEndpoint({
    summary: 'Create a money order',
    description:
      'Initiate a money order to send funds to another user. Requires USER role and KYC verification. Country code must be provided in x-country-code header.',
    authenticated: true,
    roles: [Role.USER],
    kycVerified: true,
  })
  async createMoneyOrder(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @User() user: ReqUserPayload,
    @Body() body: CreateMoneyOrderReqDTO,
  ) {
    const payload: CreateMoneyOrderDTO = {
      sendingAmount: body.sendingAmount,
      receiverAmount: body.receiverAmount,
      exchangeRate: body.exchangeRate,
      userId: user.user.userId,
      receiverId: body.receiver,
      idempotentId: body.idempotentId,
    };
    await this.moneyOrderOrchestratorService.createMoneyOrder(
      payload,
      countryCode,
    );

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Money order initiated successfully')
      .build();
  }

  @Get('/')
  @RestEndpoint({
    summary: 'Filter money orders',
    description:
      'Paginated list of money orders for the country in the x-country-code header, filtered by user, status and delivery status. Never merges across countries. Admins can filter across all users; a USER role caller is always scoped to their own orders.',
    authenticated: true,
    roles: [...ADMIN_ROLES, Role.USER],
  })
  async filterMoneyOrders(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @User() user: ReqUserPayload,
    @Query() query: FilterMoneyOrdersReqDTO,
  ) {
    const isUser = user.role === Role.USER;
    const { data, count } = await this.moneyOrderOrchestratorService.filterMoneyOrders({
      country: countryCode,
      page: query.page,
      limit: query.limit,
      skip: query.skip,
      userId: isUser ? user.user.userId : query.userId,
      status: query.status,
      deliveryStatus: query.deliveryStatus,
    });

    const paginated = PaginatedData.builder<typeof data>()
      .setData(data)
      .setTotal(count)
      .setCurrentPage(query.page)
      .setPerPage(query.limit)
      .build();

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Money orders fetched successfully')
      .setData(paginated)
      .build();
  }

  @Get('/analytics')
  @RestEndpoint({
    summary: 'Money order analytics',
    description:
      "Aggregated money order analytics for the country in the x-country-code header, served from a materialized view (refreshed hourly): today's summary grouped by nation with a status breakdown, the inflow trend, and a historic daily series. Always country-scoped — never merges across countries. Requires an admin role.",
    authenticated: true,
    roles: ADMIN_ROLES,
  })
  async getAnalytics(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
  ) {
    const analytics = await this.moneyOrderOrchestratorService.getAnalytics(countryCode);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Analytics fetched successfully')
      .setData(analytics)
      .build();
  }

  @Get('/:id')
  @RestEndpoint({
    summary: 'Get money order detail',
    description:
      'Full detail of a single money order belonging to the country in the x-country-code header, including sender and receiver. Requires an admin role.',
    authenticated: true,
    roles: ADMIN_ROLES,
    apiParams: [
      { name: 'id', description: 'Money order ID', example: 'uuid-here' },
    ],
  })
  async getMoneyOrder(
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
    @Param('id') id: string,
  ) {
    const moneyOrder = await this.moneyOrderOrchestratorService.getMoneyOrderById(id, countryCode);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Money order fetched successfully')
      .setData(moneyOrder)
      .build();
  }
}
