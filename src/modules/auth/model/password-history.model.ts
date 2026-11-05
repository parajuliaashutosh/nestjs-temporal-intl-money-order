import { BaseModel } from '@/src/common/model/base.model';
import { AuthModel } from './auth.model';

export interface PasswordHistoryModel extends BaseModel {
  password: string;

  auth?: AuthModel;
}
