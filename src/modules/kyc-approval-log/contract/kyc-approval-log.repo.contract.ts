import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { CreateKycApprovalLogDTO } from '../dto/create-kyc-approval-log.dto';
import { KycApprovalLog } from '../entity/kyc-approval-log.entity';

export interface KycApprovalLogRepoContract {
  create(data: CreateKycApprovalLogDTO): Promise<KycApprovalLog>;
  filter(
    userId?: string,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<KycApprovalLog[]>>;
}
