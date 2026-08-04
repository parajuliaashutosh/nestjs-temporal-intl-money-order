import { RestEndpoint } from '@/src/common/decorator/rest-endpoint/rest-endpoint.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { PaginatedData } from '@/src/common/response-type/pagination/paginated-data';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Controller, Get, HttpCode, HttpStatus, Inject, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { KycApprovalLogContract } from '../../contract/kyc-approval-log.contract';
import { GetKycApprovalLogDTO } from '../../dto/get-kyc-approval-log.dto';
import { KycApprovalLog } from '../../entity/kyc-approval-log.entity';
import { KYC_APPROVAL_LOG_SERVICE } from '../../kyc-approval-log.constant';
import { GetKycApprovalLogsReqDTO } from './dto/get-kyc-approval-logs-req.dto';

@ApiTags('kyc-approval-log')
@Controller('kyc-approval-log')
export class KycApprovalLogController {
  constructor(
    @Inject(KYC_APPROVAL_LOG_SERVICE)
    private readonly kycApprovalLogService: KycApprovalLogContract,
  ) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RestEndpoint({
    summary: 'Get KYC approval logs',
    description:
      'Fetch a paginated list of KYC approval/rejection decisions. Admin only.',
    authenticated: true,
    roles: [Role.ADMIN, Role.SUPER_ADMIN, Role.SUDO_ADMIN],
    apiResponses: [
      {
        status: HttpStatus.OK,
        description: 'KYC approval logs fetched successfully',
        type: () => RestResponse<PaginatedData<KycApprovalLog[]>>,
      },
    ],
  })
  async getKycApprovalLogs(@Query() query: GetKycApprovalLogsReqDTO) {
    const payload: GetKycApprovalLogDTO = {
      page: query.page,
      limit: query.limit,
      userId: query.userId,
    };

    const resp = await this.kycApprovalLogService.getLogs(payload);

    const paginatedData = PaginatedData.builder<KycApprovalLog[]>()
      .setData(resp.data)
      .setCurrentPage(query.page)
      .setPerPage(query.limit)
      .setTotal(resp.count)
      .build();

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('KYC approval logs fetched successfully')
      .setData(paginatedData)
      .build();
  }
}
