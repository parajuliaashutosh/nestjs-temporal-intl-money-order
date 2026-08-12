import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { SystemConfigLogContract } from '../contract/system-config-log.contract';
import type { SystemConfigLogRepoContract } from '../contract/system-config-log.repo.contract';
import { CreateSystemConfigLogDTO } from '../dto/create-system-config-log.dto';
import { GetSystemConfigLogDTO } from '../dto/get-system-config-log.dto';
import { SystemConfigLog } from '../entity/system-config-log.entity';
import { SYSTEM_CONFIG_LOG_REPO } from '../system-config-log.constant';

@Injectable()
export class SystemConfigLogService implements SystemConfigLogContract {
  private readonly logger = new Logger(SystemConfigLogService.name);

  constructor(
    @Inject(SYSTEM_CONFIG_LOG_REPO)
    private readonly systemConfigLogRepo: SystemConfigLogRepoContract,
  ) {}

  public async log(data: CreateSystemConfigLogDTO): Promise<void> {
    try {
      await this.systemConfigLogRepo.create(data);
    } catch (error) {
      this.logger.error(
        'Failed to record system config log',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  public async getLogs(
    data: GetSystemConfigLogDTO,
  ): Promise<DataAndCount<SystemConfigLog[]>> {
    const offset = (data.page - 1) * data.limit;
    const result = await this.systemConfigLogRepo.filter(
      data.countryCode,
      data.limit,
      offset,
    );

    return DataAndCount.builder<SystemConfigLog[]>()
      .setData(result.data)
      .setCount(result.count)
      .build();
  }
}
