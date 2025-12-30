import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WalletTransaction } from './entity/wallet-transaction.entity';
import { Wallet } from './entity/wallet.entity';
import { WalletTransactionService } from './service/wallet-transaction.service';
import { WalletService } from './service/wallet.service';
import { WALLET_SERVICE, WALLET_TRANSACTION_SERVICE } from './wallet.constant';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction])],
  providers: [
    {
      provide: WALLET_SERVICE,
      useClass: WalletService,
    },
    {
      provide: WALLET_TRANSACTION_SERVICE,
      useClass: WalletTransactionService,
    },
  ],
  exports: [WALLET_SERVICE, WALLET_TRANSACTION_SERVICE],
})
export class WalletModule {}
