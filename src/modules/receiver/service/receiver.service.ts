import { AppException } from '@/src/common/exception/app.exception';
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';
import type { UserContract } from '../../user/contract/user.contract';
import { USER_SERVICE } from '../../user/user.constant';
import { CreateReceiverDTO } from '../dto/create-receiver.dto';
import { GetReceiverDTO } from '../dto/get-receiver.dto';
import { Receiver } from '../entity/receiver.entity';

@Injectable()
export class ReceiverService {
  constructor(
    @InjectRepository(Receiver) private receiverRepo: Repository<Receiver>,
    @Inject(USER_SERVICE) private userService: UserContract,
  ) {}

  async create(data: CreateReceiverDTO): Promise<Receiver> {
    const user = await this.userService.getUserById(data.userId);

    if (!user) {
      throw AppException.badRequest('USER_NOT_FOUND');
    }

    const receiver = new Receiver();
    receiver.firstName = data.firstName;
    receiver.middleName = data.middleName;
    receiver.lastName = data.lastName;
    receiver.email = data.email;
    receiver.phoneNumber = data.phoneNumber;
    receiver.address = data.address;
    receiver.bankName = data.bankName;
    receiver.bankAccountNumber = data.bankAccountNumber;
    receiver.user = user;
    return await this.receiverRepo.save(receiver);
  }

  async getReceiversByUserId(data: GetReceiverDTO): Promise<{
    data: Receiver[];
    count: number;
  }> {
    const query = this.receiverRepo
      .createQueryBuilder('receiver')
      .where('receiver.user_id = :userId', { userId: data.userId });

    if (data?.search) {
      query.andWhere(
        new Brackets((qb) => {
          qb.where('receiver.first_name ILIKE :search')
            .orWhere('receiver.last_name ILIKE :search')
            .orWhere('receiver.email ILIKE :search');
        }),
        { search: `%${data.search}%` },
      );
    }

    const [receivers, count] = await query
      .take(data.limit ?? 10)
      .skip(data.page ?? 0)
      .getManyAndCount();

    return {data: receivers, count}
  }
}
