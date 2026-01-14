import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import { UserContract } from '../contract/user.contract';
import { CreateUserDTO } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';

@Injectable()
export class UserService implements UserContract {
  constructor(@InjectRepository(User) private userRepo: Repository<User>) {}

  public async create(data: CreateUserDTO, auth: Auth): Promise<User> {
    const user = new User();
    user.firstName = data.firstName;
    user.middleName = data.middleName;
    user.lastName = data.lastName;
    user.country = data.country;
    user.auth = auth;
    return await this.userRepo.save(user);
  }

  public async verifyUserKYC(id: string): Promise<void> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) throw AppException.badRequest('USER_NOT_FOUND');

    user.kycStatus = KYCStatus.VERIFIED;

    await this.userRepo.save(user);
  }

  public async rejectUserKYC(id: string): Promise<void> {
    const user = await this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();

    if (!user) throw AppException.badRequest('USER_NOT_FOUND');

    user.kycStatus = KYCStatus.REJECTED;

    await this.userRepo.save(user);
  }

  public async getUserById(id: string): Promise<User | null> {
    return await this.userRepo
      .createQueryBuilder('user')
      .where('user.id = :id', { id })
      .getOne();
  }
}
