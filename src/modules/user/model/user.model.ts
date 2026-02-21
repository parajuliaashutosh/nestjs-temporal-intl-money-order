import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { BaseModel } from '@/src/common/model/base.model';
import { AuthModel } from '../../auth/model/auth.model';
import { MoneyOrderModel } from '../../money-order/model/money-order.model';
import { ReceiverModel } from '../../receiver/model/receiver.model';
import { WalletModel } from '../../wallet/model/wallet.model';

export interface UserModel extends BaseModel {
  firstName: string;
  middleName?: string;
  lastName: string;
  kycStatus: KYCStatus;
  country: SupportedCountry;
  wallet: WalletModel;
  auth: AuthModel;
  moneyOrders?: MoneyOrderModel[];
  receivers?: ReceiverModel[];
}
