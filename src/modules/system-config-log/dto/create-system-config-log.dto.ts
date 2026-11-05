import { SystemConfigLogAction } from '@/src/common/enum/system-config-log-action.enum';
import { SystemConfigValueSnapshot } from '../model/system-config-log.model';

export class CreateSystemConfigLogDTO {
  systemConfigId: string;
  previousValue: SystemConfigValueSnapshot | null;
  newValue: SystemConfigValueSnapshot;
  action: SystemConfigLogAction;
  changedByAuthId?: string;
}
