import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { CreateSystemConfigLogDTO } from '../dto/create-system-config-log.dto';
import { SystemConfigLog } from '../entity/system-config-log.entity';

export interface SystemConfigLogRepoContract {
  create(data: CreateSystemConfigLogDTO): Promise<SystemConfigLog>;
  filter(
    countryCode?: SupportedCountry,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<SystemConfigLog[]>>;
}
