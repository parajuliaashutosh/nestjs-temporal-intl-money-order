import { UserContextStorage } from '@/src/common/context/user.context';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { SystemConfigLogAction } from '@/src/common/enum/system-config-log-action.enum';
import { CACHE_KEYS } from '@/src/common/keys/cache.keys';
import { Inject, Injectable } from '@nestjs/common';
import { createClient } from 'redis';
import { CACHE_CLIENT } from '../../cache/cache.constant';
import type { SystemConfigLogContract } from '../../system-config-log/contract/system-config-log.contract';
import { SYSTEM_CONFIG_LOG_SERVICE } from '../../system-config-log/system-config-log.constant';
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

    @Inject(SYSTEM_CONFIG_LOG_SERVICE)
    private readonly systemConfigLogService: SystemConfigLogContract,

    @Inject(CACHE_CLIENT)
    private readonly cache: ReturnType<typeof createClient>,
  ) {}

  public async createOrUpdateSystemConfig(
    data: CreateSystemConfigDTO,
  ): Promise<SystemConfig> {
    const existing = await this.systemConfigRepo.findByCountryCode(
      data.countryCode,
    );

    const result = await this.systemConfigRepo.upsert(data);

    // invalidate cache
    await this.invalidateSystemConfigCache(data.countryCode);

    await this.systemConfigLogService.log({
      systemConfigId: result.id,
      previousValue: existing
        ? { currency: existing.currency, exchangeRate: existing.exchangeRate }
        : null,
      newValue: { currency: result.currency, exchangeRate: result.exchangeRate },
      action: existing
        ? SystemConfigLogAction.UPDATE
        : SystemConfigLogAction.CREATE,
      changedByAuthId: UserContextStorage.get()?.payload.id,
    });

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
