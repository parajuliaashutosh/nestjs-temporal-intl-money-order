import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { AdminContract } from '../contract/admin.contract';
import { CreateAdminDTO } from '../dto/create-admin.dto';
import { Admin } from '../entity/admin.entity';
import { AdminModel } from '../model/admin.model';

@Injectable()
export class AdminService implements AdminContract {
  constructor(@InjectRepository(Admin) private adminRepo: Repository<Admin>) {}

  public async create(data: CreateAdminDTO, auth: Auth): Promise<Admin> {
    const admin: Partial<AdminModel> = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      auth,
    };
    return await this.adminRepo.save(admin);
  }
}
