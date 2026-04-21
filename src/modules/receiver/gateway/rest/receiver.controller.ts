import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { PaginatedData } from '@/src/common/response-type/pagination/paginated-data';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import {
  Body,
  Controller,
  DefaultValuePipe,
  Get,
  HttpCode,
  HttpStatus,
  Inject,
  ParseIntPipe,
  Post,
  Query,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { ReceiverContract } from '../../contract/receiver.contract';
import { CreateReceiverDTO } from '../../dto/create-receiver.dto';
import { GetReceiverDTO } from '../../dto/get-receiver.dto';
import { Receiver } from '../../entity/receiver.entity';
import { RECEIVER_SERVICE } from '../../receiver.constant';
import { CreateReceiverReqDTO } from './dto/create-receiver-req.dto';

@ApiTags('receiver')
@Controller('receiver')
export class ReceiverController {
  constructor(
    @Inject(RECEIVER_SERVICE)
    private readonly receiverService: ReceiverContract,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RestEndpoint({
    summary: 'Create a new receiver',
    description:
      'Create a new receiver for the authenticated user. Requires authentication, USER role, and KYC verification.',
    authenticated: true,
    roles: [Role.USER],
    kycVerified: true,
  })
  async register(
    @CountryCode(CountryCodePipe) _: SupportedCountry,
    @User() user: ReqUserPayload,
    @Body() data: CreateReceiverReqDTO,
  ) {
    const payload: CreateReceiverDTO = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      userId: user.user.userId,
    };
    await this.receiverService.create(payload);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Receiver created successfully')
      .build();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: 'Get receivers for the authenticated user',
    description:
      'Fetch a paginated list of receivers associated with the authenticated user. Supports optional search query. Requires authentication, USER role, and KYC verification.',
    authenticated: true,
    roles: [Role.USER],
    kycVerified: true,
    apiResponses: [
      {
        status: HttpStatus.OK,
        description: 'Receivers fetched successfully',
        type: () => RestResponse<PaginatedData<Receiver>>,
      },
    ],
  })
  async getReceiver(
    @User() user: ReqUserPayload,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('perPage', new DefaultValuePipe(10), ParseIntPipe) perPage: number,
    @Query('search') search?: string,
  ) {
    const payload: GetReceiverDTO = {
      page: page,
      limit: perPage,
      search: search,
      userId: user.user.userId,
    };

    const resp = await this.receiverService.getReceiversByUserId(payload);

    const paginatedData = PaginatedData.builder<Receiver[]>()
      .setData(resp.data)
      .setCurrentPage(page)
      .setPerPage(perPage)
      .setTotal(resp.count)
      .build();

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Receiver fetched successfully')
      .setData(paginatedData)
      .build();
  }
}
