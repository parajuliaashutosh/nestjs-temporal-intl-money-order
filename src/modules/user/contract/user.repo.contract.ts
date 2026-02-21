import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { Auth } from '../../auth/entity/auth.entity';
import { User } from '../entity/user.entity';
import { UserModel } from '../model/user.model';

export interface UserRepoContract {
  create(user: Partial<UserModel>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByAuth(auth: Auth): Promise<User | null>;
  updateKYCStatus(id: string, status: KYCStatus): Promise<User | null>;
  update(id: string, user: Partial<UserModel>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
