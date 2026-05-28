import { BaseModel } from '@/src/common/model/base.model';
import { AuthModel } from '../../auth/model/auth.model';

export interface DeviceConfigModel extends BaseModel {
  fcm: string;
  deviceId: string;
  platform: string;
  badgeCount: number;
  auth: AuthModel;
}
