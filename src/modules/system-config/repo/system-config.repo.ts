import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { SystemConfigRepoContract } from '../contract/system-config.repo.contract';
import { CreateSystemConfigDTO } from '../dto/create-system-config.dto';
import { SystemConfig } from '../entity/system-config.entity';
import { SystemConfigModel } from '../model/system-config.model';

@Injectable()
export class SystemConfigRepo implements SystemConfigRepoContract {
  constructor(
    @InjectRepository(SystemConfig)
    private systemConfigRepo: Repository<SystemConfig>,
  ) {}

  public async create(
    systemConfig: Partial<SystemConfigModel>,
  ): Promise<SystemConfig> {
    return await this.systemConfigRepo.save(systemConfig);
  }

  public async findByCountryCode(
    countryCode: SupportedCountry,
  ): Promise<SystemConfig | null> {
    return await this.systemConfigRepo
      .createQueryBuilder('systemConfig')
      .where('systemConfig.countryCode = :countryCode', { countryCode })
      .getOne();
  }

  public async update(
    id: string,
    systemConfig: Partial<SystemConfigModel>,
  ): Promise<SystemConfig | null> {
    await this.systemConfigRepo.update(id, systemConfig);
    return await this.systemConfigRepo.findOne({ where: { id } });
  }

  public async save(systemConfig: SystemConfig): Promise<SystemConfig> {
    return await this.systemConfigRepo.save(systemConfig);
  }

  public async upsert(data: CreateSystemConfigDTO): Promise<SystemConfig> {
    // Check if exists
    const existing = await this.findByCountryCode(data.countryCode);

    if (existing) {
      // Update existing
      existing.currency = data.currency;
      existing.exchangeRate = BigInt(data.exchangeRate).toString();
      return await this.save(existing);
    }

    // Create new
    const systemConfig = new SystemConfig();
    systemConfig.countryCode = data.countryCode;
    systemConfig.currency = data.currency;
    systemConfig.exchangeRate = BigInt(data.exchangeRate).toString();

    return await this.save(systemConfig);
  }

  public async findAll(): Promise<SystemConfig[]> {
    return await this.systemConfigRepo
      .createQueryBuilder('systemConfig')
      .orderBy('systemConfig.createdAt', 'DESC')
      .getMany();
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.systemConfigRepo.delete(id);
    return result.affected > 0;
  }
}
