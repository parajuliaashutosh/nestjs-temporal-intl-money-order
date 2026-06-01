import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Auth } from '../../auth/entity/auth.entity';
import { GetLoginLogDTO } from '../dto/get-login-log.dto';
import { UserDeviceDataDTO } from '../dto/user-device-data.dto';
import { LoginLog } from '../entity/login-log.entity';

export interface LoginLogContract {
  createLoginLog(data: UserDeviceDataDTO, auth: Auth): Promise<LoginLog>;
  getLoginLogsByAuthId(
    data: GetLoginLogDTO,
  ): Promise<DataAndCount<LoginLog[]>>;
  markLogout(loginLogId: string, authId: string): Promise<void>;
}
