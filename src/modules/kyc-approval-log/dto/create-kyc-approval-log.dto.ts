import { KYCStatus } from '@/src/common/enum/kyc-status.enum';

export class CreateKycApprovalLogDTO {
  userId: string;
  previousStatus: KYCStatus;
  newStatus: KYCStatus;
  reviewedByAuthId?: string;
  remark?: string;
}
