import { DataAndCount } from "@/src/common/response-type/pagination/data-and-count";
import { CreateReceiverDTO } from "../dto/create-receiver.dto";
import { GetReceiverDTO } from "../dto/get-receiver.dto";
import { Receiver } from "../entity/receiver.entity";

export interface ReceiverContract {
    create(data: CreateReceiverDTO): Promise<Receiver>;
    getReceiversByUserId(data: GetReceiverDTO): Promise<DataAndCount<Receiver[]>>;
}