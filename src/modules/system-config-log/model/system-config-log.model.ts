import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { SystemConfigLogAction } from '@/src/common/enum/system-config-log-action.enum';
import { BaseModel } from '@/src/common/model/base.model';
import { AuthModel } from '../../auth/model/auth.model';
import { SystemConfigModel } from '../../system-config/model/system-config.model';

export interface SystemConfigValueSnapshot {
  currency: SupportedCurrency;
  exchangeRate: string;
}

export interface SystemConfigLogModel extends BaseModel {
  systemConfig: SystemConfigModel;
  previousValue: SystemConfigValueSnapshot | null;
  newValue: SystemConfigValueSnapshot;
  changedBy?: AuthModel;
  action: SystemConfigLogAction;
}
