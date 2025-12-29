import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SystemConfig } from './entity/system-config.entity';
import { SystemConfigService } from './service/system-config.service';
import { SYSTEM_CONFIG_SERVICE } from './system-config.constant';

@Module({
  imports: [
    TypeOrmModule.forFeature([SystemConfig]),
  ],
  providers: [{
    provide: SYSTEM_CONFIG_SERVICE,
    useClass: SystemConfigService,
  }],
  exports: [SYSTEM_CONFIG_SERVICE],
})
export class SystemConfigModule {}
