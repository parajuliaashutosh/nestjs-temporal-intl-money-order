import { Auth } from '../../auth/entity/auth.entity';
import { UserDeviceDataDTO } from '../dto/user-device-data.dto';

export interface LoginLogContract {
  createLoginLog(data: UserDeviceDataDTO, auth: Auth): Promise<void>;
}
