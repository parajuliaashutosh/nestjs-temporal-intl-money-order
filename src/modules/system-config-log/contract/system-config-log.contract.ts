import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { CreateSystemConfigLogDTO } from '../dto/create-system-config-log.dto';
import { GetSystemConfigLogDTO } from '../dto/get-system-config-log.dto';
import { SystemConfigLog } from '../entity/system-config-log.entity';

export interface SystemConfigLogContract {
  log(data: CreateSystemConfigLogDTO): Promise<void>;
  getLogs(
    data: GetSystemConfigLogDTO,
  ): Promise<DataAndCount<SystemConfigLog[]>>;
}
