import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { Wallet } from '../entity/wallet.entity';
import { WalletModel } from '../model/wallet.model';

export interface WalletRepoContract {
  create(wallet: Partial<WalletModel>): Promise<Wallet>;
  findById(id: string): Promise<Wallet | null>;
  findByUserIdAndCurrency(
    userId: string,
    currency: SupportedCurrency,
  ): Promise<Wallet | null>;
  findByUserIdAndCurrencyWithLock(
    userId: string,
    currency: SupportedCurrency,
  ): Promise<Wallet | null>;
  findByIdWithLock(id: string): Promise<Wallet | null>;
  update(id: string, wallet: Partial<WalletModel>): Promise<Wallet | null>;
  save(wallet: Wallet): Promise<Wallet>;
  delete(id: string): Promise<boolean>;
}
