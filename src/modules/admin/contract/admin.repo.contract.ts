import { Admin } from '../entity/admin.entity';
import { AdminModel } from '../model/admin.model';

export interface AdminRepoContract {
  create(admin: Partial<AdminModel>): Promise<Admin>;
  findById(id: string): Promise<Admin>;
}
