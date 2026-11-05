import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuthRepoContract } from '../contract/auth.repo.contract';
import { Auth } from '../entity/auth.entity';
import { PasswordHistory } from '../entity/password-history.entity';
import { AuthModel } from '../model/auth.model';

@Injectable()
export class AuthRepo implements AuthRepoContract {
  constructor(
    @InjectRepository(Auth) private authRepo: Repository<Auth>,
    @InjectRepository(PasswordHistory)
    private passwordHistoryRepo: Repository<PasswordHistory>,
  ) {}

  public async create(auth: Partial<AuthModel>): Promise<Auth> {
    const resp = await this.authRepo.save(auth);
    const { password, ...result } = resp;
    void password;
    return result as Auth;
  }

  public async findByEmailOrPhoneForAuthentication(
    username: string,
  ): Promise<Auth | null> {
    return this.authRepo
      .createQueryBuilder('auth')
      .addSelect('auth.password')
      .leftJoinAndSelect('auth.users', 'users')
      .leftJoinAndSelect('auth.admin', 'admin')
      .where('auth.email = :username OR auth.phone = :username', { username })
      .getOne();
  }

  public async findByIdForAuthentication(id: string): Promise<Auth | null> {
    return this.authRepo
      .createQueryBuilder('auth')
      .addSelect('auth.password')
      .where('auth.id = :id', { id })
      .getOne();
  }

  public async findById(id: string): Promise<Auth | null> {
    return this.authRepo
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.users', 'users')
      .leftJoinAndSelect('auth.admin', 'admin')
      .where('auth.id = :id', { id })
      .getOne();
  }

  public async getAuthByEmail(email: string): Promise<Auth | null> {
    return await this.authRepo
      .createQueryBuilder('auth')
      .where('auth.email = :email', { email })
      .getOne();
  }

  public async getAuthByPhone(phone: string): Promise<Auth | null> {
    return await this.authRepo
      .createQueryBuilder('auth')
      .where('auth.phone = :phone', { phone })
      .getOne();
  }

  public async updatePassword(
    id: string,
    hashedPassword: string,
  ): Promise<void> {
    await this.authRepo.update({ id }, { password: hashedPassword });
  }

  public async createPasswordHistory(
    authId: string,
    hashedPassword: string,
  ): Promise<PasswordHistory> {
    return await this.passwordHistoryRepo.save({
      password: hashedPassword,
      auth: { id: authId },
    });
  }

  public async getRecentPasswordHistories(
    authId: string,
    limit: number,
  ): Promise<PasswordHistory[]> {
    return await this.passwordHistoryRepo
      .createQueryBuilder('passwordHistory')
      .addSelect('passwordHistory.password')
      .where('passwordHistory.auth_id = :authId', { authId })
      .orderBy('passwordHistory.created_at', 'DESC')
      .take(limit)
      .getMany();
  }

  public async getPasswordHistories(
    authId: string,
  ): Promise<PasswordHistory[]> {
    return await this.passwordHistoryRepo
      .createQueryBuilder('passwordHistory')
      .where('passwordHistory.auth_id = :authId', { authId })
      .orderBy('passwordHistory.created_at', 'DESC')
      .getMany();
  }

  public async getAuthByUserIdAndCountry(
    userId: string,
    country: SupportedCountry,
  ): Promise<Auth | null> {
    return await this.authRepo
      .createQueryBuilder('auth')
      .leftJoinAndSelect('auth.users', 'users')
      .where('users.id = :userId AND users.country = :country', {
        userId,
        country,
      })
      .getOne();
  }
}
