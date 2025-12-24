import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserService } from './service/user.service';
import { USER_SERVICE } from './user.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
  ],
  providers: [{
    provide: USER_SERVICE,
    useClass: UserService,
  }],
  exports: [USER_SERVICE],
})
export class UserModule {}
