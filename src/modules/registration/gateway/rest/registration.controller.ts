import { Body, Post } from '@nestjs/common';
import { RegistrationContract } from '../../contract/registration.contract';
import { RegisterAdminDTO } from '../../dto/register-admin.dto';
import { RegisterUserDTO } from '../../dto/register-user.dto';

export class RegistrationController {
  constructor(private readonly registrationService: RegistrationContract) {}

  @Post('/register')
  async register(@Body() data: RegisterUserDTO) {
    await this.registrationService.registerUser(data);
  }

  @Post('/register-admin')
  async registerAdmin(@Body() data: RegisterAdminDTO) {
    await this.registrationService.registerAdmin(data);
  }
}
