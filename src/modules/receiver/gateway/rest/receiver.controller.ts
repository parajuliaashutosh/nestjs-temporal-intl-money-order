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
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
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
  @Authenticate()
  @Authorize([Role.USER])
  @ApiOperation({
    summary: 'Create a new receiver',
    description:
      'Register a new money order receiver. Requires authentication and USER role. Country code must be provided in x-country-code header.',
  })
  @ApiSecurity('JWT-auth')
  @ApiSecurity('x-country-code')
  @ApiResponse({
    status: 201,
    description: 'Receiver created successfully',
    schema: {
      example: {
        success: true,
        message: 'Receiver created successfully',
        data: null,
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - USER role required',
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
      userId: user.userId,
    };
    await this.receiverService.create(payload);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Receiver created successfully')
      .build();
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  @Authenticate()
  @Authorize([Role.USER])
  @ApiOperation({
    summary: 'Get receivers list',
    description:
      'Get paginated list of receivers for the authenticated user. Requires authentication and USER role.',
  })
  @ApiSecurity('JWT-auth')
  @ApiSecurity('x-country-code')
  @ApiQuery({
    name: 'page',
    required: false,
    type: Number,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'perPage',
    required: false,
    type: Number,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Search query for receiver name or email',
  })
  @ApiResponse({
    status: 200,
    description: 'Receivers fetched successfully',
    schema: {
      example: {
        success: true,
        message: 'Receiver fetched successfully',
        data: {
          data: [
            {
              id: 'receiver-uuid',
              firstName: 'Jane',
              lastName: 'Doe',
              email: 'jane@example.com',
              phoneNumber: '+1234567890',
              bankName: 'Example Bank',
              bankAccountNumber: '1234567890',
            },
          ],
          pagination: {
            currentPage: 1,
            perPage: 10,
            total: 50,
            totalPages: 5,
          },
        },
      },
    },
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized - Authentication required',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - USER role required',
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
      userId: user.userId,
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
