import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AdminRepoContract } from '../contract/admin.repo.contract';
import { Admin } from '../entity/admin.entity';
import { AdminModel } from '../model/admin.model';

@Injectable()
export class AdminRepo implements AdminRepoContract {
  constructor(@InjectRepository(Admin) private adminRepo: Repository<Admin>) {}

  public async create(admin: Partial<AdminModel>): Promise<Admin> {
    return this.adminRepo.save(admin);
  }

  public async findById(id: string): Promise<Admin> {
    return this.adminRepo.findOne({ where: { id } });
  }
}
