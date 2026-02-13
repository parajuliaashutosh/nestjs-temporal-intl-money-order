import { WalletTopUpDTO } from '../dto/wallet-topup.dto';
import { WalletUpdateBalanceDTO } from '../dto/wallet-update-balance.dto';
import { Wallet } from '../entity/wallet.entity';

export interface WalletContract {
  walletTopUp(data: WalletTopUpDTO): Promise<Wallet | string>;
  updateBalance(data: WalletUpdateBalanceDTO): Promise<Wallet>;
}
