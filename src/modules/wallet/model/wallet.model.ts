import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { BaseModel } from '@/src/common/model/base.model';
import { UserModel } from '../../user/model/user.model';

export interface WalletModel extends BaseModel {
  //storing in cents to avoid floating point issues
  balance: string;
  currency: SupportedCurrency;
  user: UserModel;
}
