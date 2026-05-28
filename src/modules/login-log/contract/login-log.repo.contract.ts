import { LoginLogModel } from '../model/login-log.model';

export interface LoginLogRepoContract {
  create(loginLog: Partial<LoginLogModel>): Promise<LoginLogModel>;
}
