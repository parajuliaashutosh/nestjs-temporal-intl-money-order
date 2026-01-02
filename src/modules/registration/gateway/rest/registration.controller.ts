import { Authenticate } from '@/src/common/decorator/authenticate/rest/authenticate.decorator';
import { Authorize } from '@/src/common/decorator/authenticate/rest/authorize.decorator';
import { CountryCode } from '@/src/common/decorator/header/country-code.decorator';
import { CountryCodePipe } from '@/src/common/decorator/validator/pipe/country-code.pipe';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Body, Controller, Inject, Param, Patch, Post } from '@nestjs/common';
import type { RegistrationContract } from '../../contract/registration.contract';
import { RegisterAdminDTO } from '../../dto/register-admin.dto';
import { RegisterUserDTO } from '../../dto/register-user.dto';
import { REGISTRATION_SERVICE } from '../../registration.constant';
import { RegisterUserReqDTO } from './request/register-user-req.dto';

@Controller()
export class RegistrationController {
  constructor(
    @Inject(REGISTRATION_SERVICE)
    private readonly registrationService: RegistrationContract,
  ) {}

  @Post('/register')
  async register(@Body() data: RegisterUserReqDTO, @CountryCode(CountryCodePipe) countryCode: SupportedCountry) {
    const payload: RegisterUserDTO = {
      email: data.email,
      password: data.password,
      phone: data.phone,
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      country: countryCode,
    };

    const resp = await this.registrationService.registerUser(payload);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User registered successfully')
      .setData(resp)
      .build();
  }

  @Post('/register-admin')
  @Authenticate()
  @Authorize([Role.SUDO_ADMIN, Role.SUPER_ADMIN])
  async registerAdmin(@Body() data: RegisterAdminDTO) {
    const resp = await this.registrationService.registerAdmin(data);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Admin registered successfully')
      .setData(resp)
      .build();
  }

  @Patch('/verify-user-kyc/:id')
  async verifyUser(@Param('id') id: string) {
    await this.registrationService.verifyUserKYC(id);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User verified successfully')
      .build();
  }


  @Patch('/reject-user-kyc/:id')
  async rejectUserKYC(@Param('id') id: string) {
    await this.registrationService.rejectUserKYC(id);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User rejected successfully')
      .build();
  }
}
