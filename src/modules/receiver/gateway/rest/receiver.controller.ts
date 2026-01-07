import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { User } from '@/src/common/decorator/authenticate/rest/user.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import type { ReqUserPayload } from '@/src/common/guard/rest/authentication.guard';
import { PaginatedData } from '@/src/common/response-type/pagination/paginated-data';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Body, Controller, DefaultValuePipe, Get, HttpCode, HttpStatus, Inject, Param, ParseIntPipe, Post } from '@nestjs/common';
import type { ReceiverContract } from '../../contract/receiver.contract';
import { CreateReceiverDTO } from '../../dto/create-receiver.dto';
import { GetReceiverDTO } from '../../dto/get-receiver.dto';
import { Receiver } from '../../entity/receiver.entity';
import { RECEIVER_SERVICE } from '../../receiver.constant';
import { CreateReceiverReqDTO } from './dto/create-receiver-req.dto';

@Controller('receiver')
export class ReceiverController {
  constructor(
    @Inject(RECEIVER_SERVICE)
    private readonly receiverService: ReceiverContract,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Authenticate()
  @Authorize([Role.SUDO_ADMIN, Role.SUPER_ADMIN, Role.ADMIN])
  async register(@CountryCode(CountryCodePipe) _: SupportedCountry, @User() user: ReqUserPayload, @Body() data: CreateReceiverReqDTO) {
    const payload: CreateReceiverDTO = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      userId: user.userId,
    }
    await this.receiverService.create(payload);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Receiver created successfully')
      .build();  
  
  }

  @Get()
  async getReceiver(
    @User() user: ReqUserPayload,
    @Param('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Param('perPage', new DefaultValuePipe(1), ParseIntPipe) perPage: number,
    @Param('search') search?: string ) {
   
    const payload: GetReceiverDTO = {
      page: page,
      limit: perPage,
      search: search,
      userId: user.userId,
    }
    
    const resp = await this.receiverService.getReceiversByUserId(payload);

    const paginatedData = PaginatedData.builder<Receiver[]>()
    .setData(resp.data)
    .setCurrentPage(page)
    .setPerPage(perPage)
    .setTotal(resp.count)
    .build();

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('System config fetched successfully')
      .setData(paginatedData)
      .build();
  }
}
