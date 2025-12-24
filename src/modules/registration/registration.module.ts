import { Module } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';
import { AuthModule } from '../auth/auth.module';
import { UserModule } from '../user/user.module';
import { RegistrationService } from './service/registration.service';

@Module({
  imports: [AuthModule, UserModule, AdminModule],
  
  providers: [RegistrationService]
})
export class RegistrationModule {}
