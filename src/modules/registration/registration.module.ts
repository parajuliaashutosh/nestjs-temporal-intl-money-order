import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RegistrationController } from './gateway/rest/registration.controller';
import { REGISTRATION_SERVICE } from './registration.constant';
import { RegistrationService } from './service/registration.service';

@Module({
  imports: [AuthModule, UserModule, AdminModule],

  controllers: [RegistrationController],
  providers: [
    {
      provide: REGISTRATION_SERVICE,
      useClass: RegistrationService,
    },
  ],
  exports: [REGISTRATION_SERVICE],
})
export class RegistrationModule {}
