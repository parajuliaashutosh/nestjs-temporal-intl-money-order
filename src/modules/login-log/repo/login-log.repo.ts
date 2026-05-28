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
  ): Promise<LoginLogModel> {
    return await this.repo.save(loginLog);
  }
}
