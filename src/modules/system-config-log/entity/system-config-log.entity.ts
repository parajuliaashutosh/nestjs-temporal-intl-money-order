import Base from '@/src/common/entity/base.entity';
import { SystemConfigLogAction } from '@/src/common/enum/system-config-log-action.enum';
import { Column, Entity, Index, JoinColumn, ManyToOne } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { SystemConfig } from '../../system-config/entity/system-config.entity';
import { SystemConfigLogModel } from '../model/system-config-log.model';
import type { SystemConfigValueSnapshot } from '../model/system-config-log.model';

@Entity('system_config_log')
@Index(['systemConfig'])
export class SystemConfigLog extends Base implements SystemConfigLogModel {
  @ManyToOne(() => SystemConfig, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'system_config_id' })
  systemConfig: SystemConfig;

  @Column({ type: 'jsonb', name: 'previous_value', nullable: true })
  previousValue: SystemConfigValueSnapshot | null;

  @Column({ type: 'jsonb', name: 'new_value' })
  newValue: SystemConfigValueSnapshot;

  @ManyToOne(() => Auth, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'changed_by' })
  changedBy?: Auth;

  @Column({
    type: 'enum',
    enum: SystemConfigLogAction,
    name: 'action',
  })
  action: SystemConfigLogAction;
}
