import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { CreateSystemConfigDTO } from '../dto/create-system-config.dto';
import { SystemConfig } from '../entity/system-config.entity';
import { SystemConfigModel } from '../model/system-config.model';

export interface SystemConfigRepoContract {
  create(systemConfig: Partial<SystemConfigModel>): Promise<SystemConfig>;
  findByCountryCode(
    countryCode: SupportedCountry,
  ): Promise<SystemConfig | null>;
  update(
    id: string,
    systemConfig: Partial<SystemConfigModel>,
  ): Promise<SystemConfig | null>;
  save(systemConfig: SystemConfig): Promise<SystemConfig>;
  upsert(data: CreateSystemConfigDTO): Promise<SystemConfig>;
  findAll(): Promise<SystemConfig[]>;
  delete(id: string): Promise<boolean>;
}
