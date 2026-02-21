import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import type { UserRepoContract } from '../contract/user.repo.contract';
import { User } from '../entity/user.entity';
import { UserModel } from '../model/user.model';

@Injectable()
export class UserRepo implements UserRepoContract {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  public async create(user: Partial<UserModel>): Promise<User> {
    return await this.userRepo.save(user);
  }

  public async findById(id: string): Promise<User | null> {
    return await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.auth', 'auth')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('user.id = :id', { id })
      .getOne();
  }

  public async findByAuth(auth: Auth): Promise<User | null> {
    return await this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.auth', 'auth')
      .leftJoinAndSelect('user.wallet', 'wallet')
      .where('user.auth_id = :authId', { authId: auth.id })
      .getOne();
  }

  public async updateKYCStatus(
    id: string,
    status: KYCStatus,
  ): Promise<User | null> {
    await this.userRepo.update(id, { kycStatus: status });
    return await this.findById(id);
  }

  public async update(
    id: string,
    user: Partial<UserModel>,
  ): Promise<User | null> {
    await this.userRepo.update(id, user);
    return await this.findById(id);
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.userRepo.delete(id);
    return result.affected > 0;
  }
}
