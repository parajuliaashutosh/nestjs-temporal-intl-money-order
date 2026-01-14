import { Role } from '@/src/common/enum/role.enum';
import type { RegistrationContract } from '@/src/modules/registration/contract/registration.contract';
import { RegisterAdminDTO } from '@/src/modules/registration/dto/register-admin.dto';
import { REGISTRATION_SERVICE } from '@/src/modules/registration/registration.constant';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class AdminSeederService {
  constructor(
    @Inject(REGISTRATION_SERVICE)
    private readonly registrationService: RegistrationContract,
  ) {}

  async seed() {
    const adminData: RegisterAdminDTO = {
      email: 'sudo@admin.com',
      password: 'Admin@123',
      phone: '9843818516',
      role: Role.SUDO_ADMIN,

      firstName: 'Sudo',
      lastName: 'Admin',
    };

    // Create admin user
    await this.registrationService.registerAdmin(adminData);
    console.log('Admin user seeded successfully:', adminData.email);
  }
}
