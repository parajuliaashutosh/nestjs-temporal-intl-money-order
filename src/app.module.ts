import { AuthModule } from '@/src/modules/auth/auth.module';
import { UserModule } from '@/src/modules/user/user.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_GUARD } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppExceptionFilter } from './common/exception/app.exception.middleware';
import { ValidationExceptionFilter } from './common/exception/validation.exception.middleware';
import { UserAgentGuard } from './common/guard/rest/user-agent.guard';
import { envValidationSchema } from './config/env.validation';
import { typeOrmConfigAsync } from './config/orm.config';
import { ActivityLogModule } from './modules/activity-log/activity-log.module';
import { AdminModule } from './modules/admin/admin.module';
import { CacheModule } from './modules/infrastructure/cache/cache.module';
import { StripeModule } from './modules/infrastructure/stripe/stripe.module';
import { TemporalModule } from './modules/infrastructure/temporal/temporal.module';
import { MoneyOrderOrchestratorModule } from './modules/money-order-orchestrator/money-order-orchestrator.module';
import { MoneyOrderModule } from './modules/money-order/money-order.module';
import { ReceiverModule } from './modules/receiver/receiver.module';
import { RegistrationModule } from './modules/registration/registration.module';
import { SystemConfigModule } from './modules/system-config/system-config.module';
import { WalletModule } from './modules/wallet/wallet.module';

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
    ReceiverModule,
    AdminModule,
    RegistrationModule,
    SystemConfigModule,
    ActivityLogModule,
    WalletModule,
    CacheModule,
    TemporalModule,
    ReceiverModule,
    MoneyOrderModule,
    MoneyOrderOrchestratorModule,
    StripeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: UserAgentGuard,
    },
    {
      provide: APP_FILTER,
      useClass: ValidationExceptionFilter,
    },
    {
      provide: APP_FILTER,
      useClass: AppExceptionFilter,
    },
  ],
})
export class AppModule {}
