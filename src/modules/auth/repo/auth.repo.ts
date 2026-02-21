import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Auth } from '../entity/auth.entity';

@Injectable()
export class AuthRepo {
  constructor(@InjectRepository(Auth) private authRepo: Repository<Auth>) {}

  public async create(auth: Partial<Auth>): Promise<Auth> {
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
}
