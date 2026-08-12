import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { KycApprovalLogContract } from '../contract/kyc-approval-log.contract';
import type { KycApprovalLogRepoContract } from '../contract/kyc-approval-log.repo.contract';
import { CreateKycApprovalLogDTO } from '../dto/create-kyc-approval-log.dto';
import { GetKycApprovalLogDTO } from '../dto/get-kyc-approval-log.dto';
import { KycApprovalLog } from '../entity/kyc-approval-log.entity';
import { KYC_APPROVAL_LOG_REPO } from '../kyc-approval-log.constant';

@Injectable()
export class KycApprovalLogService implements KycApprovalLogContract {
  private readonly logger = new Logger(KycApprovalLogService.name);

  constructor(
    @Inject(KYC_APPROVAL_LOG_REPO)
    private readonly kycApprovalLogRepo: KycApprovalLogRepoContract,
  ) {}

  public async log(data: CreateKycApprovalLogDTO): Promise<void> {
    try {
      await this.kycApprovalLogRepo.create(data);
    } catch (error) {
      this.logger.error(
        'Failed to record KYC approval log',
        error instanceof Error ? error.stack : String(error),
      );
    }
  }

  public async getLogs(
    data: GetKycApprovalLogDTO,
  ): Promise<DataAndCount<KycApprovalLog[]>> {
    const offset = (data.page - 1) * data.limit;
    const result = await this.kycApprovalLogRepo.filter(
      data.userId,
      data.limit,
      offset,
    );

    return DataAndCount.builder<KycApprovalLog[]>()
      .setData(result.data)
      .setCount(result.count)
      .build();
  }
}
