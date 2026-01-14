import { typeOrmConfigAsync } from '@/src/config/orm.config';
import { AuthModule } from '@/src/modules/auth/auth.module';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RegistrationModule } from '../../registration/registration.module';
import { AdminSeederService } from './service/admin.service';
// import { AdminSeederService } from './service/admin.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    RegistrationModule,
    TypeOrmModule.forRootAsync(typeOrmConfigAsync),
    AuthModule,
  ],
  providers: [AdminSeederService],
  exports: [AdminSeederService]
})
export class AdminSeederModule {}
