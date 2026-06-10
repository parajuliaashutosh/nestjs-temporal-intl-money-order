import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entity/user.entity';
import { UserController } from './gateway/rest/user.controller';
import { UserRepo } from './repo/user.repo';
import { UserService } from './service/user.service';
import { USER_REPO, USER_SERVICE } from './user.constant';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [
    {
      provide: USER_SERVICE,
      useClass: UserService,
    },
    {
      provide: USER_REPO,
      useClass: UserRepo,
    },
  ],
  controllers: [UserController],
  exports: [USER_SERVICE],
})
export class UserModule {}
