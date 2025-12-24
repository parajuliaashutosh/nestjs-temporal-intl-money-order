import { Module } from '@nestjs/common';
import { UserService } from './service/user.service';
import { USER_SERVICE } from './user.constant';

@Module({
  providers: [{
    provide: USER_SERVICE,
    useClass: UserService,
  }],
  exports: [USER_SERVICE],
})
export class UserModule {}
