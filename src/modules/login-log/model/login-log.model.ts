import { BaseModel } from '@/src/common/model/base.model';
import { AuthModel } from '../../auth/model/auth.model';

export interface LoginLogModel extends BaseModel {
  loginAt: Date;
  logoutAt?: Date;
  ip: string;
  deviceId: string;
  location: string;
  city: string;
  region: string;
  country: string;
  asn: string;
  timezone: string;
  os: string;
  browser: string;
  auth: AuthModel;

  rawUserAgent?: string;
}
