import { EmailVerificationStatus } from '@/src/common/enum/email-verification-status.enum';
import { PhoneVerificationStatus } from '@/src/common/enum/phone-verification-status';
import { Role } from '@/src/common/enum/role.enum';
import { BaseModel } from '@/src/common/model/base.model';
import { AdminModel } from '../../admin/model/admin.model';
import { LoginLogModel } from '../../login-log/model/login-log.model';

export interface AuthModel extends BaseModel {
  email: string;
  phone?: string;
  emailVerificationStatus: EmailVerificationStatus;
  phoneVerificationStatus: PhoneVerificationStatus;
  role: Role;
  password: string;

  tokenVersion: number;

  admin?: AdminModel;
  loginLogs?: LoginLogModel[];
}
