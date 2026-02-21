import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { CreateSystemConfigDTO } from '../dto/create-system-config.dto';
import { SystemConfig } from '../entity/system-config.entity';

export interface SystemConfigContract {
  createOrUpdateSystemConfig(
    data: CreateSystemConfigDTO,
  ): Promise<SystemConfig>;
  getSystemConfigByKey(
    countryCode: SupportedCountry,
  ): Promise<SystemConfig | null>;
}
