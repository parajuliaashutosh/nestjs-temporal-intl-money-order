import { Transactional } from '@/src/common/decorator/orm/transactional.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { Inject, Injectable } from '@nestjs/common';
import { ADMIN_SERVICE } from '../../admin/admin.constant';
import type { AdminContract } from '../../admin/contract/admin.contract';
import { AUTH_SERVICE } from '../../auth/auth.constant';
import type { AuthContract } from '../../auth/contract/auth.contract';
import { CreateAuthDTO } from '../../auth/dto/create-auth.dto';
import type { UserContract } from '../../user/contract/user.contract';
import { CreateUserDTO } from '../../user/dto/create-user.dto';
import { USER_SERVICE } from '../../user/user.constant';
import { RegistrationContract } from '../contract/registration.contract';
import { RegisterAdminDTO } from '../dto/register-admin.dto';
import { RegisterUserDTO } from '../dto/register-user.dto';

@Injectable()
export class RegistrationService implements RegistrationContract {
  constructor(
    @Inject(AUTH_SERVICE)
    private readonly authService: AuthContract,

    @Inject(USER_SERVICE)
    private readonly userService: UserContract,

    @Inject(ADMIN_SERVICE)
    private readonly adminService: AdminContract,
  ) {}

  @Transactional()
  public async registerUser(data: RegisterUserDTO) {
    const authPayload: CreateAuthDTO = {
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: Role.USER,
    };
    const auth = await this.authService.create(authPayload);

    const userPayload: CreateUserDTO = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
    };
    const user = await this.userService.create(userPayload, auth);

    return user;
  }

  @Transactional()
  public async registerAdmin(data: RegisterAdminDTO) {
    const authPayload: CreateAuthDTO = {
      email: data.email,
      password: data.password,
      phone: data.phone,
      role: data.role,
    };
    const auth = await this.authService.create(authPayload);

    const userPayload: CreateUserDTO = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
    };
    const user = await this.userService.create(userPayload, auth);

    return user;
  }
}
