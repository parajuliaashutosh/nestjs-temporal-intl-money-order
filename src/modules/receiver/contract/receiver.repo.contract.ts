import { DataAndCount } from '@/src/common/response-type/pagination/data-and-count';
import { Receiver } from '../entity/receiver.entity';
import { ReceiverModel } from '../model/receiver.model';

export interface ReceiverRepoContract {
  create(receiver: Partial<ReceiverModel>): Promise<Receiver>;
  findByUserId(
    userId: string,
    search?: string,
    limit?: number,
    offset?: number,
  ): Promise<DataAndCount<Receiver[]>>;
  findById(id: string): Promise<Receiver | null>;
  findByIdAndUserId(id: string, userId: string): Promise<Receiver | null>;
  findByBankAccount(
    bankAccountNumber: string,
    userId: string,
  ): Promise<Receiver | null>;
  update(
    id: string,
    receiver: Partial<ReceiverModel>,
  ): Promise<Receiver | null>;
  delete(id: string): Promise<boolean>;
}
