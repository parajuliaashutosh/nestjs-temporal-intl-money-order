import { CreateMoneyOrderDTO } from "../dto/create-money-order.dto";
import { MoneyOrder } from "../entity/money-order.entity";

export interface MoneyOrderContract {
    createMoneyOrder(data: CreateMoneyOrderDTO): Promise<MoneyOrder>;
    screenReceiver(moneyOrderId: string): Promise<boolean>;
}