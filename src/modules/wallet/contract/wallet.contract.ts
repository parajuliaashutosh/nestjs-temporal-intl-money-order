import { WalletTopUpDTO } from "../dto/wallet-topup.dto";
import { Wallet } from "../entity/wallet.entity";

export interface WalletContract {
    walletTopUp(data: WalletTopUpDTO): Promise<Wallet |string>;
}