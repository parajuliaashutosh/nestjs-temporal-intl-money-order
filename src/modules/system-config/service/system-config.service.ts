import { CACHE_KEYS } from '@/src/common/keys/cache.keys';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createClient } from 'redis';
import { Repository } from 'typeorm';
import { CACHE_CLIENT } from '../../infrastructure/cache/cache.constant';
import { SystemConfigContract } from '../contract/system-config.contract';
import { CreateSystemConfigDTO } from '../dto/create-system-config.dto';
import { SystemConfig } from '../entity/system-config.entity';

@Injectable()
export class SystemConfigService implements SystemConfigContract {
  constructor(
    @InjectRepository(SystemConfig)
    private readonly systemConfigRepo: Repository<SystemConfig>,

    @Inject(CACHE_CLIENT)
    private readonly cache: ReturnType<typeof createClient>,
  ) {}

  public async createOrUpdateSystemConfig(
    data: CreateSystemConfigDTO,
  ): Promise<SystemConfig> {
    const systemConfig = new SystemConfig();
    systemConfig.countryCode = data.countryCode;
    systemConfig.currency = data.currency;
    systemConfig.exchangeRate = data.exchangeRate;

    const saved = await this.systemConfigRepo.save(systemConfig);

    // invalidate cache
    const cacheKey = CACHE_KEYS.systemConfigByCountry(data.countryCode);
    await this.cache.del(cacheKey);

    return saved;
  }

  public async getSystemConfigByKey(
    countryCode: string,
  ): Promise<SystemConfig | null> {
    const cacheKey = CACHE_KEYS.systemConfigByCountry(countryCode);

    // 1️⃣ Try cache
    const cached = await this.cache.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as SystemConfig;
    }

    // 2️⃣ Query DB
    const config = await this.systemConfigRepo
      .createQueryBuilder('systemConfig')
      .where('systemConfig.countryCode = :countryCode', { countryCode })
      .getOne();

    if (config) {
      await this.cache.set(cacheKey, JSON.stringify(config));
    }

    return config;
  }
}
