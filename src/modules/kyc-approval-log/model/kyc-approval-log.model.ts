import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { BaseModel } from '@/src/common/model/base.model';
import { AuthModel } from '../../auth/model/auth.model';
import { UserModel } from '../../user/model/user.model';

export interface KycApprovalLogModel extends BaseModel {
  user: UserModel;
  previousStatus: KYCStatus;
  newStatus: KYCStatus;
  reviewedBy?: AuthModel;
  remark?: string;
}
