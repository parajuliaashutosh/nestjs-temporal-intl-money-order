import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KycApprovalLog } from './entity/kyc-approval-log.entity';
import { KycApprovalLogController } from './gateway/rest/kyc-approval-log.controller';
import {
  KYC_APPROVAL_LOG_REPO,
  KYC_APPROVAL_LOG_SERVICE,
} from './kyc-approval-log.constant';
import { KycApprovalLogRepo } from './repo/kyc-approval-log.repo';
import { KycApprovalLogService } from './service/kyc-approval-log.service';

@Module({
  imports: [TypeOrmModule.forFeature([KycApprovalLog])],
  providers: [
    {
      provide: KYC_APPROVAL_LOG_SERVICE,
      useClass: KycApprovalLogService,
    },
    {
      provide: KYC_APPROVAL_LOG_REPO,
      useClass: KycApprovalLogRepo,
    },
  ],
  controllers: [KycApprovalLogController],
  exports: [KYC_APPROVAL_LOG_SERVICE],
})
export class KycApprovalLogModule {}
