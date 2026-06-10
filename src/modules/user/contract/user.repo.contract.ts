import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Auth } from '../../auth/entity/auth.entity';
import { FilterUsersDTO } from '../dto/filter-users.dto';
import { User } from '../entity/user.entity';
import { UserModel } from '../model/user.model';

export interface UserRepoContract {
  create(user: Partial<UserModel>): Promise<User>;
  findById(id: string): Promise<User | null>;
  findByAuth(auth: Auth): Promise<User | null>;
  filter(filter: FilterUsersDTO): Promise<DataAndCount<User[]>>;
  updateKYCStatus(id: string, status: KYCStatus): Promise<User | null>;
  update(id: string, user: Partial<UserModel>): Promise<User | null>;
  delete(id: string): Promise<boolean>;
}
