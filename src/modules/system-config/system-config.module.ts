import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '../auth/auth.module';
import { CacheModule } from '../infrastructure/cache/cache.module';
import { SystemConfig } from './entity/system-config.entity';
import { SystemConfigController } from './gateway/rest/system-config.controller';
import { SystemConfigService } from './service/system-config.service';
import { SYSTEM_CONFIG_SERVICE } from './system-config.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig]), AuthModule, CacheModule
  ],
  providers: [{
    provide: SYSTEM_CONFIG_SERVICE,
    useClass: SystemConfigService,
  }],
  exports: [SYSTEM_CONFIG_SERVICE],
  controllers: [SystemConfigController],
})
export class SystemConfigModule {}
