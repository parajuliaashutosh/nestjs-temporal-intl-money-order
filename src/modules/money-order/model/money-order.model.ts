import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { BaseModel } from '@/src/common/model/base.model';
import { ReceiverModel } from '../../receiver/model/receiver.model';
import { UserModel } from '../../user/model/user.model';

export interface MoneyOrderModel extends BaseModel {
  sendingAmount: string;
  receiverAmount: string;
  promiseExchangeRate: string;
  status: MoneyOrderStatus;
  deliveryStatus: MoneyOrderDeliveryStatus;
  metadata: Record<string, any> | null;
  user: UserModel;
  receiver: ReceiverModel;
}
