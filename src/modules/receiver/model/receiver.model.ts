import { BaseModel } from '@/src/common/model/base.model';
import { MoneyOrderModel } from '../../money-order/model/money-order.model';
import { UserModel } from '../../user/model/user.model';

export interface ReceiverModel extends BaseModel {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phoneNumber: string;

  address: string;
  bankName: string;
  bankAccountNumber: string;
  user: UserModel;
  moneyOrders?: MoneyOrderModel[];
}
