import { AuthModule } from '@/src/modules/auth/auth.module';
import { UserModule } from '@/src/modules/user/user.module';
import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validation';
import { typeOrmConfigAsync } from './config/orm.config';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { AdminModule } from './modules/admin/admin.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { WalletModule } from './modules/wallet/wallet.module';
import { RedisModule } from './modules/infrastructure/redis/redis.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: `.env`,
    }),
    CacheModule.register({
      isGlobal: true,
    }),
    
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
    UserModule,
    AdminModule,
    RegistrationModule,
    SystemConfigModule,
    ActivityLogModule,
    WalletModule,
    RedisModule,
  ],
  controllers: [],
  providers: [],
  // providers: [{
  //   provide: APP_GUARD,
  //   useClass: UserAgentGuard,
  // }],
})
export class AppModule {}
