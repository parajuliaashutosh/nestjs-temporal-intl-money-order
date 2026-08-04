import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { User } from '../../user/entity/user.entity';
import { KycApprovalLogRepoContract } from '../contract/kyc-approval-log.repo.contract';
import { CreateKycApprovalLogDTO } from '../dto/create-kyc-approval-log.dto';
import { KycApprovalLog } from '../entity/kyc-approval-log.entity';

@Injectable()
export class KycApprovalLogRepo implements KycApprovalLogRepoContract {
  constructor(
    @InjectRepository(KycApprovalLog)
    private repo: Repository<KycApprovalLog>,
  ) {}

  public async create(data: CreateKycApprovalLogDTO): Promise<KycApprovalLog> {
    const log = this.repo.create({
      user: { id: data.userId } as User,
      previousStatus: data.previousStatus,
      newStatus: data.newStatus,
      reviewedBy: data.reviewedByAuthId
        ? ({ id: data.reviewedByAuthId } as Auth)
        : undefined,
      remark: data.remark,
    });
    return await this.repo.save(log);
  }

  public async filter(
    userId?: string,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<KycApprovalLog[]>> {
    const query = this.repo
      .createQueryBuilder('kyc_approval_log')
      .leftJoinAndSelect('kyc_approval_log.user', 'user')
      .leftJoinAndSelect('kyc_approval_log.reviewedBy', 'reviewedBy')
      .orderBy('kyc_approval_log.created_at', 'DESC');

    if (userId) {
      query.andWhere('user.id = :userId', { userId });
    }

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    const [data, count] = await query.getManyAndCount();

    return { data, count };
  }
}
