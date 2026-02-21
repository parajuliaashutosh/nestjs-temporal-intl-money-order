import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import type { ReceiverRepoContract } from '../contract/receiver.repo.contract';
import { Receiver } from '../entity/receiver.entity';
import { ReceiverModel } from '../model/receiver.model';

@Injectable()
export class ReceiverRepo implements ReceiverRepoContract {
  constructor(
    @InjectRepository(Receiver) private receiverRepo: Repository<Receiver>,
  ) {}

  public async create(receiver: Partial<ReceiverModel>): Promise<Receiver> {
    return await this.receiverRepo.save(receiver);
  }

  public async findByUserId(
    userId: string,
    search?: string,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<Receiver[]>> {
    const query = this.receiverRepo
      .createQueryBuilder('receiver')
      .where('receiver.user_id = :userId', { userId });

    if (search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('receiver.first_name ILIKE :search')
            .orWhere('receiver.last_name ILIKE :search')
            .orWhere('receiver.email ILIKE :search');
        }),
        { search: `%${search}%` },
      );
    }

    if (limit) {
      query.limit(limit);
    }

    if (offset) {
      query.offset(offset);
    }

    const [data, count] = await query.getManyAndCount();

    return {
      data,
      count,
    };
  }

  public async findById(id: string): Promise<Receiver | null> {
    return await this.receiverRepo
      .createQueryBuilder('receiver')
      .leftJoinAndSelect('receiver.user', 'user')
      .where('receiver.id = :id', { id })
      .getOne();
  }

  public async findByIdAndUserId(
    id: string,
    userId: string,
  ): Promise<Receiver | null> {
    return await this.receiverRepo
      .createQueryBuilder('receiver')
      .leftJoinAndSelect('receiver.user', 'user')
      .where('receiver.id = :id', { id })
      .andWhere('receiver.user_id = :userId', { userId })
      .getOne();
  }

  public async findByBankAccount(
    bankAccountNumber: string,
    userId: string,
  ): Promise<Receiver | null> {
    return await this.receiverRepo
      .createQueryBuilder('receiver')
      .where('receiver.bank_account_number = :bankAccountNumber', {
        bankAccountNumber,
      })
      .andWhere('receiver.user_id = :userId', { userId })
      .getOne();
  }

  public async update(
    id: string,
    receiver: Partial<ReceiverModel>,
  ): Promise<Receiver | null> {
    await this.receiverRepo.update(id, receiver);
    return await this.findById(id);
  }

  public async delete(id: string): Promise<boolean> {
    const result = await this.receiverRepo.delete(id);
    return result.affected > 0;
  }
}
