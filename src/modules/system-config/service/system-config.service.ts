import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { CACHE_KEYS } from '@/src/common/keys/cache.keys';
import { Inject, Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { CACHE_CLIENT } from '../../infrastructure/cache/cache.constant';
import { SystemConfigContract } from '../contract/system-config.contract';
import type { SystemConfigRepoContract } from '../contract/system-config.repo.contract';
import { CreateSystemConfigDTO } from '../dto/create-system-config.dto';
import { SystemConfig } from '../entity/system-config.entity';
import { SYSTEM_CONFIG_REPO } from '../system-config.constant';

@Injectable()
export class SystemConfigService implements SystemConfigContract {
  constructor(
    @Inject(SYSTEM_CONFIG_REPO)
    private readonly systemConfigRepo: SystemConfigRepoContract,

    @Inject(CACHE_CLIENT)
    private readonly cache: ReturnType<typeof createClient>,
  ) {}

  public async createOrUpdateSystemConfig(
    data: CreateSystemConfigDTO,
  ): Promise<SystemConfig> {
    const result = await this.systemConfigRepo.upsert(data);

    // invalidate cache
    await this.invalidateSystemConfigCache(data.countryCode);

    return result;
  }

  private async invalidateSystemConfigCache(
    countryCode: string,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.systemConfigByCountry(countryCode);
    await this.cache.del(cacheKey);
  }

  public async getSystemConfigByKey(
    countryCode: SupportedCountry,
  ): Promise<SystemConfig | null> {
    const cacheKey = CACHE_KEYS.systemConfigByCountry(countryCode);

    // write back cache

    const cached: string | null = (await this.cache.get(cacheKey)) as string;
    if (cached) {
      return JSON.parse(cached) as SystemConfig;
    }

    const config = await this.systemConfigRepo.findByCountryCode(countryCode);

    if (config) {
      await this.cache.set(cacheKey, JSON.stringify(config));
    }

    return config;
  }
}
