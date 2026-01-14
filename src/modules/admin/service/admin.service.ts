import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { AdminContract } from '../contract/admin.contract';
import { CreateAdminDTO } from '../dto/create-admin.dto';
import { Admin } from '../entity/admin.entity';

@Injectable()
export class AdminService implements AdminContract{
  constructor(@InjectRepository(Admin) private adminRepo: Repository<Admin>) {}

  public async create(data: CreateAdminDTO, auth: Auth): Promise<Admin> {
    const admin = new Admin();
    admin.firstName = data.firstName;
    admin.middleName = data.middleName;
    admin.lastName = data.lastName;
    admin.auth = auth;
    return await this.adminRepo.save(admin);
  }
}
