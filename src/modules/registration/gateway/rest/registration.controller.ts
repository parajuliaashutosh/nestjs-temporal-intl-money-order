import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { RegistrationContract } from '../../contract/registration.contract';
import { RegisterAdminDTO } from '../../dto/register-admin.dto';
import { RegisterUserDTO } from '../../dto/register-user.dto';
import { REGISTRATION_SERVICE } from '../../registration.constant';

@Controller()
export class RegistrationController {
  constructor(
    @Inject(REGISTRATION_SERVICE)
    private readonly registrationService: RegistrationContract,
  ) {}

  @Post('/register')
  async register(@Body() data: RegisterUserDTO) {
    const resp = await this.registrationService.registerUser(data);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('User registered successfully')
      .setData(resp)
      .build();
  }

  @Post('/register-admin')
  async registerAdmin(@Body() data: RegisterAdminDTO) {
    const resp = await this.registrationService.registerAdmin(data);
    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Admin registered successfully')
      .setData(resp)
      .build();
  }
}
