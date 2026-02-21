import { BaseModel } from '@/src/common/model/base.model';
import { AuthModel } from '../../auth/model/auth.model';

export interface AdminModel extends BaseModel {
  firstName: string;
  middleName?: string;
  lastName: string;
  auth: AuthModel;
}
