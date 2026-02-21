import { AppException } from '@/src/common/exception/app.exception';
import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Inject, Injectable } from '@nestjs/common';
import type { UserContract } from '../../user/contract/user.contract';
import { USER_SERVICE } from '../../user/user.constant';
import { ReceiverContract } from '../contract/receiver.contract';
import type { ReceiverRepoContract } from '../contract/receiver.repo.contract';
import { CreateReceiverDTO } from '../dto/create-receiver.dto';
import { GetReceiverDTO } from '../dto/get-receiver.dto';
import { Receiver } from '../entity/receiver.entity';
import { RECEIVER_REPO } from '../receiver.constant';

@Injectable()
export class ReceiverService implements ReceiverContract {
  constructor(
    @Inject(RECEIVER_REPO)
    private readonly receiverRepo: ReceiverRepoContract,
    @Inject(USER_SERVICE) private userService: UserContract,
  ) {}

  async create(data: CreateReceiverDTO): Promise<Receiver> {
    const user = await this.userService.getUserById(data.userId);

    if (!user) {
      throw AppException.badRequest('USER_NOT_FOUND');
    }

    const receiver: Partial<Receiver> = {
      firstName: data.firstName,
      middleName: data.middleName,
      lastName: data.lastName,
      email: data.email,
      phoneNumber: data.phoneNumber,
      address: data.address,
      bankName: data.bankName,
      bankAccountNumber: data.bankAccountNumber,
      user: user,
    };

    return await this.receiverRepo.create(receiver);
  }

  async getReceiversByUserId(
    data: GetReceiverDTO,
  ): Promise<DataAndCount<Receiver[]>> {
    const offset = (data.page - 1) * data.limit;
    const result = await this.receiverRepo.findByUserId(
      data.userId,
      data.search,
      data.limit,
      offset,
    );

    return DataAndCount.builder<Receiver[]>()
      .setData(result.data)
      .setCount(result.count)
      .build();
  }

  async getReceiverById(receiverId: string): Promise<Receiver | null> {
    return await this.receiverRepo.findById(receiverId);
  }

  async getReceiverByIdAndUserId(
    receiverId: string,
    userId: string,
  ): Promise<Receiver | null> {
    return await this.receiverRepo.findByIdAndUserId(receiverId, userId);
  }
}
