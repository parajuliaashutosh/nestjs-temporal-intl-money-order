import { AuthModule } from '@/src/modules/auth/auth.module';
import { UserModule } from '@/src/modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { envValidationSchema } from './config/env.validation';
import { typeOrmConfigAsync } from './config/orm.config';
import { AdminModule } from './modules/admin/admin.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: envValidationSchema,
      envFilePath: `.env`,
    }),
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
    UserModule,
    AdminModule,
    RegistrationModule,
    SystemConfigModule,
  ],
  controllers: [],
  // providers: [{
  //   provide: APP_GUARD,
  //   useClass: UserAgentGuard,
  // }],
})
export class AppModule {}
