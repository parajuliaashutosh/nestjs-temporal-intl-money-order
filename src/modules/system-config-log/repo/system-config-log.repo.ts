import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { SystemConfig } from '../../system-config/entity/system-config.entity';
import { SystemConfigLogRepoContract } from '../contract/system-config-log.repo.contract';
import { CreateSystemConfigLogDTO } from '../dto/create-system-config-log.dto';
import { SystemConfigLog } from '../entity/system-config-log.entity';

@Injectable()
export class SystemConfigLogRepo implements SystemConfigLogRepoContract {
  constructor(
    @InjectRepository(SystemConfigLog)
    private repo: Repository<SystemConfigLog>,
  ) {}

  public async create(
    data: CreateSystemConfigLogDTO,
  ): Promise<SystemConfigLog> {
    const log = this.repo.create({
      systemConfig: { id: data.systemConfigId } as SystemConfig,
      previousValue: data.previousValue,
      newValue: data.newValue,
      action: data.action,
      changedBy: data.changedByAuthId
        ? ({ id: data.changedByAuthId } as Auth)
        : undefined,
    });
    return await this.repo.save(log);
  }

  public async filter(
    countryCode?: SupportedCountry,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<SystemConfigLog[]>> {
    const query = this.repo
      .createQueryBuilder('system_config_log')
      .leftJoinAndSelect('system_config_log.systemConfig', 'systemConfig')
      .leftJoinAndSelect('system_config_log.changedBy', 'changedBy')
      .orderBy('system_config_log.created_at', 'DESC');

    if (countryCode) {
      query.andWhere('systemConfig.countryCode = :countryCode', {
        countryCode,
      });
    }

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    const [data, count] = await query.getManyAndCount();

    return { data, count };
  }
}
