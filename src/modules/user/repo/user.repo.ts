import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import { Auth } from '../../auth/entity/auth.entity';
import type { UserRepoContract } from '../contract/user.repo.contract';
import { FilterUsersDTO } from '../dto/filter-users.dto';
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

  public async filter(
    filter: FilterUsersDTO,
  ): Promise<DataAndCount<User[]>> {
    const query = this.userRepo
      .createQueryBuilder('user')
      .leftJoin('user.auth', 'auth')
      // minimal projection for list views — full detail lives on findById
      .select([
        'user.id',
        'user.firstName',
        'user.lastName',
        'user.kycStatus',
        'user.country',
        'user.createdAt',
        'auth.id',
        'auth.email',
        'auth.phone',
      ]);

    if (filter.authId)
      query.andWhere('auth.id = :authId', { authId: filter.authId });

    if (filter.kycStatus)
      query.andWhere('user.kycStatus = :kycStatus', {
        kycStatus: filter.kycStatus,
      });

    if (filter.country)
      query.andWhere('user.country = :country', {
        country: filter.country,
      });

    if (filter.search) {
      const search = `%${filter.search}%`;
      query.andWhere(
        new Brackets((qb) => {
          qb.where('user.firstName ILIKE :search', { search })
            .orWhere('user.middleName ILIKE :search', { search })
            .orWhere('user.lastName ILIKE :search', { search })
            .orWhere('auth.email ILIKE :search', { search })
            .orWhere('auth.phone ILIKE :search', { search });
        }),
      );
    }

    const [data, count] = await query
      .orderBy('user.createdAt', 'DESC')
      .skip(filter.skip)
      .take(filter.limit)
      .getManyAndCount();

    return DataAndCount.builder<User[]>().setData(data).setCount(count).build();
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
    const query = await this.findById(id);
    query.kycStatus = status;
    query.invalidatedVersion = query.version;
    return await this.userRepo.save(query);
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
