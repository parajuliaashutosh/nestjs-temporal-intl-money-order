import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { CACHE_KEYS } from '@/src/common/keys/cache.keys';
import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient } from 'redis';
import { Auth } from '../../auth/entity/auth.entity';
import { CACHE_CLIENT } from '../../cache/cache.constant';
import { UserContract } from '../contract/user.contract';
import type { UserRepoContract } from '../contract/user.repo.contract';
import { CreateUserDTO } from '../dto/create-user.dto';
import { User } from '../entity/user.entity';
import { USER_REPO } from '../user.constant';

@Injectable()
export class UserService implements UserContract {
  constructor(
    private readonly configService: ConfigService,

    @Inject(USER_REPO)
    private readonly userRepo: UserRepoContract,

    @Inject(CACHE_CLIENT)
    private readonly cacheClient: ReturnType<typeof createClient>,
  ) {}

  public async create(data: CreateUserDTO, auth: Auth): Promise<User> {
    const user: Partial<User> = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      country: data.country,
      auth: auth,
    };
    return await this.userRepo.create(user);
  }

  public async verifyUserKYC(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);

    if (!user) throw AppException.badRequest('USER_NOT_FOUND');

    const resp = await this.userRepo.updateKYCStatus(id, KYCStatus.VERIFIED);

    // caching the invalidated version for the user,
    const cacheKey = CACHE_KEYS.userInvalidatedVersion(id);
    await this.cacheClient.set(cacheKey, resp.invalidatedVersion.toString(), {
      EX: this.configService.getOrThrow<number>('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
  }

  public async rejectUserKYC(id: string): Promise<void> {
    const user = await this.userRepo.findById(id);

    if (!user) throw AppException.badRequest('USER_NOT_FOUND');

    const resp = await this.userRepo.updateKYCStatus(id, KYCStatus.REJECTED);

    // caching the invalidated version for the user,
    const cacheKey = CACHE_KEYS.userInvalidatedVersion(id);
    await this.cacheClient.set(cacheKey, resp.invalidatedVersion.toString(), {
      EX: this.configService.getOrThrow<number>('JWT_ACCESS_TOKEN_EXPIRATION'),
    });
  }

  public async getUserById(id: string): Promise<User | null> {
    return await this.userRepo.findById(id);
  }
}
