import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateAdminDTO } from '../dto/create-admin.dto';
import { Admin } from '../entity/admin.entity';

@Injectable()
export class AdminService {
  constructor(@InjectRepository(Admin) private adminRepo: Repository<Admin>) {}

  public async create(data: CreateAdminDTO): Promise<Admin> {
    const admin = new Admin();
    admin.firstName = data.firstName;
    admin.middleName = data.middleName;
    admin.lastName = data.lastName;
    return await this.adminRepo.save(admin);
  }
}
