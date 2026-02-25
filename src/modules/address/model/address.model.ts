import { BaseModel } from '@/src/common/model/base.model';

export interface AddressModel extends BaseModel {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}
