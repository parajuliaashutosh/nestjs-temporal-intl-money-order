import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { CreateKycApprovalLogDTO } from '../dto/create-kyc-approval-log.dto';
import { GetKycApprovalLogDTO } from '../dto/get-kyc-approval-log.dto';
import { KycApprovalLog } from '../entity/kyc-approval-log.entity';

export interface KycApprovalLogContract {
  log(data: CreateKycApprovalLogDTO): Promise<void>;
  getLogs(data: GetKycApprovalLogDTO): Promise<DataAndCount<KycApprovalLog[]>>;
}
