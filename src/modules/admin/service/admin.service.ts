import { Inject, Injectable } from '@nestjs/common';
import { Auth } from '../../auth/entity/auth.entity';
import { ADMIN_REPO } from '../admin.constant';
import { AdminContract } from '../contract/admin.contract';
import type { AdminRepoContract } from '../contract/admin.repo.contract';
import { CreateAdminDTO } from '../dto/create-admin.dto';
import { Admin } from '../entity/admin.entity';
import { AdminModel } from '../model/admin.model';

@Injectable()
export class AdminService implements AdminContract {
  constructor(@Inject(ADMIN_REPO) private adminRepo: AdminRepoContract) {}

  public async create(data: CreateAdminDTO, auth: Auth): Promise<Admin> {
    const admin: Partial<AdminModel> = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      auth,
    };
    return await this.adminRepo.create(admin);
  }
}
