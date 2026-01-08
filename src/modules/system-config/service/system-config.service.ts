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

    if(await this.getSystemConfigByKey(data.countryCode)) {
      // update existing
      const existingConfig = await this.systemConfigRepo
        .createQueryBuilder('systemConfig')
        .where('systemConfig.countryCode = :countryCode', { countryCode: data.countryCode })
        .getOne();

      if (existingConfig) {
        existingConfig.currency = data.currency;
        existingConfig.exchangeRate = BigInt(data.exchangeRate).toString();

        const updated =  await this.systemConfigRepo.save(existingConfig);

        // invalidate cache
        await this.invalidateSystemConfigCache(data.countryCode);

        return updated;
      }
    }

    // create new
    const systemConfig = new SystemConfig();
    systemConfig.countryCode = data.countryCode;
    systemConfig.currency = data.currency;
    systemConfig.exchangeRate = BigInt(data.exchangeRate).toString();
    
    const saved = await this.systemConfigRepo.save(systemConfig);

    // invalidate cache
   await this.invalidateSystemConfigCache(data.countryCode);

    return saved;
  }

  public async invalidateSystemConfigCache(
    countryCode: string,
  ): Promise<void> {
    const cacheKey = CACHE_KEYS.systemConfigByCountry(countryCode);
    await this.cache.del(cacheKey);
  }

  public async getSystemConfigByKey(
    countryCode: string,
  ): Promise<SystemConfig | null> {
    const cacheKey = CACHE_KEYS.systemConfigByCountry(countryCode);

    // write back cache
    
    const cached: string | null = await this.cache.get(cacheKey) as string;
    if (cached) {
      return JSON.parse(cached) as SystemConfig;
    }

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
