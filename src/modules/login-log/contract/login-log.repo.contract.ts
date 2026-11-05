import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { LoginLog } from '../entity/login-log.entity';
import { LoginLogModel } from '../model/login-log.model';

export interface LoginLogRepoContract {
  create(loginLog: Partial<LoginLogModel>): Promise<LoginLog>;
  findByAuthId(
    authId: string,
    search?: string,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<LoginLog[]>>;
  findById(id: string): Promise<LoginLog | null>;
  findByIdAndAuthId(id: string, authId: string): Promise<LoginLog | null>;
  update(id: string, loginLog: Partial<LoginLogModel>): Promise<void>;
}
