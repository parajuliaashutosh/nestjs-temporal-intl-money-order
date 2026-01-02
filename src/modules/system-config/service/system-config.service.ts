import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SystemConfigContract } from '../contract/system-config.contract';
import { CreateSystemConfigDTO } from '../dto/create-system-config.dto';
import { SystemConfig } from '../entity/system-config.entity';

@Injectable()
export class SystemConfigService implements SystemConfigContract {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepo: Repository<SystemConfig>,
  ) {}

  public createOrUpdateSystemConfig(
    data: CreateSystemConfigDTO,
  ): Promise<SystemConfig> {
    const systemConfig = new SystemConfig();
    systemConfig.countryCode = data.countryCode;
    systemConfig.currency = data.currency;
    systemConfig.exchangeRate = data.exchangeRate;

    return this.systemConfigRepo.save(systemConfig);
  }

  public async getSystemConfigByKey(
    countryCode: string,
  ): Promise<SystemConfig | null> {
    return this.systemConfigRepo
      .createQueryBuilder('systemConfig')
      .where('systemConfig.countryCode = :countryCode', { countryCode })
      .getOne();
  }
}
