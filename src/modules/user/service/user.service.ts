import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { Inject, Injectable } from '@nestjs/common';
import { Auth } from '../../auth/entity/auth.entity';
import { UserContract } from '../contract/user.contract';
import type { UserRepoContract } from '../contract/user.repo.contract';
import { CreateUserDTO } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';
import { USER_REPO } from '../user.constant';

@Injectable()
export class UserService implements UserContract {
  constructor(
    @Inject(USER_REPO)
    private readonly userRepo: UserRepoContract,
  ) {}

  public async create(data: CreateUserDTO, auth: Auth): Promise<User> {
    const user: Partial<User> = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      country: data.country,
      auth: auth,
    };
    throw AppException.badRequest('USER_CREATION_FAILED');
    return await this.userRepo.create(user);
  }

  public async verifyUserKYC(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);

    if (!user) throw AppException.badRequest('USER_NOT_FOUND');

    await this.userRepo.updateKYCStatus(id, KYCStatus.VERIFIED);
  }

  public async rejectUserKYC(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);

    if (!user) throw AppException.badRequest('USER_NOT_FOUND');

    await this.userRepo.updateKYCStatus(id, KYCStatus.REJECTED);
  }

  public async getUserById(id: string): Promise<User | null> {
    return await this.userRepo.findById(id);
  }
}
