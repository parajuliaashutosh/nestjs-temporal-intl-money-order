import { RestResponse } from '@/src/common/respose-type/rest/rest-response';
import { Body, Controller, Inject, Post } from '@nestjs/common';
import type { RegistrationContract } from '../../contract/registration.contract';
import { RegisterAdminDTO } from '../../dto/register-admin.dto';
import { RegisterUserDTO } from '../../dto/register-user.dto';
import { REGISTRATION_SERVICE } from '../../registration.constant';

@Controller()
export class RegistrationController {
  constructor(
    @Inject(REGISTRATION_SERVICE)
    private readonly registrationService: RegistrationContract) {}

  @Post('/register')
  async register(@Body() data: RegisterUserDTO) {
    const resp = await this.registrationService.registerUser(data);
     return new RestResponse(true, "User registered successfully", resp);
  }

  @Post('/register-admin')
  async registerAdmin(@Body() data: RegisterAdminDTO) {
    const resp = await this.registrationService.registerAdmin(data);
    return new RestResponse(true, "Admin registered successfully", resp);
  }
}
