import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Body, Controller, Inject, Param, Patch, Post } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { RegistrationContract } from '../../contract/registration.contract';
import { RegisterAdminDTO } from '../../dto/register-admin.dto';
import { RegisterUserDTO } from '../../dto/register-user.dto';
import { REGISTRATION_SERVICE } from '../../registration.constant';
import { RegisterUserReqDTO } from './request/register-user-req.dto';

@ApiTags('registration')
@Controller()
export class RegistrationController {
  constructor(
    @Inject(REGISTRATION_SERVICE)
    private readonly registrationService: RegistrationContract,
  ) {}

  @Post('/register')
  @ApiOperation({
    summary: 'Register a new user',
    description:
      'Register a new user with personal details. Country code must be provided in x-country-code header.',
  })
  @ApiSecurity('x-country-code')
  @ApiResponse({
    status: 201,
    description: 'User registered successfully',
    schema: {
      example: {
        success: true,
        message: 'User registered successfully',
        data: {
          id: 'uuid',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
        },
      },
    },
  })
  @ApiResponse({
    status: 400,
    description:
      'Bad request - Invalid input data or missing country code header',
  })
  @ApiResponse({
    status: 409,
    description: 'Conflict - User already exists',
  })
  async register(
    @Body() data: RegisterUserReqDTO,
    @CountryCode(CountryCodePipe) countryCode: SupportedCountry,
  ) {
    const payload: RegisterUserDTO = {
      email: data.email,
      password: data.password,
      phone: data.phone,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      country: countryCode,
    };

    await this.registrationService.registerUser(payload);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User registered successfully')
      .build();
  }

  @Post('/register-admin')
  @RestEndpoint({
    summary: 'Register a new admin',
    description:
      'Register a new admin with personal details. Requires SUPER_ADMIN role.',
    authenticated: true,
    roles: [Role.SUPER_ADMIN],
  })
  async registerAdmin(@Body() data: RegisterAdminDTO) {
    const resp = await this.registrationService.registerAdmin(data);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Admin registered successfully')
      .setData(resp)
      .build();
  }

  @Patch('/verify-user-kyc/:id')
  @RestEndpoint({
    summary: 'Verify user KYC',
    description: 'Verify user KYC by ID. Requires ADMIN or SUPER_ADMIN role.',
    authenticated: true,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
    apiParams: [
      {
        name: 'id',
        description: 'User ID',
        example: 'uuid-here',
      },
    ],
  })
  async verifyUser(@Param('id') id: string) {
    await this.registrationService.verifyUserKYC(id);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User verified successfully')
      .build();
  }

  @Patch('/reject-user-kyc/:id')
  @RestEndpoint({
    summary: 'Reject user KYC',
    description: 'Reject user KYC by ID. Requires ADMIN or SUPER_ADMIN role.',
    authenticated: true,
    roles: [Role.ADMIN, Role.SUPER_ADMIN],
    apiParams: [
      {
        name: 'id',
        description: 'User ID',
        example: 'uuid-here',
      },
    ],
  })
  async rejectUserKYC(@Param('id') id: string) {
    await this.registrationService.rejectUserKYC(id);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User rejected successfully')
      .build();
  }
}
