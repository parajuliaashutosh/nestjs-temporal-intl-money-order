import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LoginLog } from './entity/login-log.entity';
import { LOGIN_LOG_REPO, LOGIN_LOG_SERVICE } from './login-log.constant';
import { LoginLogRepo } from './repo/login-log.repo';
import { LoginLogService } from './service/login-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([LoginLog])],
  providers: [
    {
      provide: LOGIN_LOG_SERVICE,
      useClass: LoginLogService,
    },
    {
      provide: LOGIN_LOG_REPO,
      useClass: LoginLogRepo,
    },
  ],
  exports: [LOGIN_LOG_SERVICE],
})
export class LoginLogModule {}
