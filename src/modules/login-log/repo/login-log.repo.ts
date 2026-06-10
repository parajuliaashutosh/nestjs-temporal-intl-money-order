import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LoginLogRepoContract } from '../contract/login-log.repo.contract';
import { LoginLog } from '../entity/login-log.entity';
import { LoginLogModel } from '../model/login-log.model';

@Injectable()
export class LoginLogRepo implements LoginLogRepoContract {
  constructor(@InjectRepository(LoginLog) private repo: Repository<LoginLog>) {}

  public async create(
    loginLog: Partial<LoginLogModel>,
  ): Promise<LoginLog> {
    return await this.repo.save(loginLog);
  }

  public async findByAuthId(
    authId: string,
    search?: string,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<LoginLog[]>> {
    const query = this.repo
      .createQueryBuilder('login_log')
      .leftJoin('login_log.auth', 'auth')
      .where('auth.id = :authId', { authId })
      .orderBy('login_log.login_at', 'DESC');

    if (search) {
      query.andWhere(
        '(login_log.ip ILIKE :search OR login_log.device_id ILIKE :search OR login_log.city ILIKE :search OR login_log.region ILIKE :search OR login_log.country ILIKE :search OR login_log.os ILIKE :search OR login_log.browser ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    const [data, count] = await query.getManyAndCount();

    return {
      data,
      count,
    };
  }

  public async findByIdAndAuthId(
    id: string,
    authId: string,
  ): Promise<LoginLog | null> {
    return await this.repo
      .createQueryBuilder('login_log')
      .leftJoin('login_log.auth', 'auth')
      .where('login_log.id = :id', { id })
      .andWhere('auth.id = :authId', { authId })
      .getOne();
  }

  public async update(
    id: string,
    loginLog: Partial<LoginLogModel>,
  ): Promise<void> {
    await this.repo.update(id, loginLog);
  }
}
