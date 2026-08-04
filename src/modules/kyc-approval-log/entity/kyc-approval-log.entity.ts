import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import Base from '@/src/common/entity/base.entity';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { User } from '../../user/entity/user.entity';
import { KycApprovalLogModel } from '../model/kyc-approval-log.model';

@Entity('kyc_approval_log')
@Index(['user'])
export class KycApprovalLog extends Base implements KycApprovalLogModel {
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    name: 'previous_status',
  })
  previousStatus: KYCStatus;

  @Column({
    type: 'enum',
    enum: KYCStatus,
    name: 'new_status',
  })
  newStatus: KYCStatus;

  @ManyToOne(() => Auth, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'reviewed_by' })
  reviewedBy?: Auth;

  @Column({ nullable: true })
  remark?: string;
}
