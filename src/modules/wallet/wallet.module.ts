import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { WalletTransaction } from './entity/wallet-transaction.entity';
import { Wallet } from './entity/wallet.entity';
import { WalletController } from './gateway/rest/wallet.controller';
import { WalletTransactionRepo } from './repo/wallet-transaction.repo';
import { WalletRepo } from './repo/wallet.repo';
import { WalletTransactionService } from './service/wallet-transaction.service';
import { WalletService } from './service/wallet.service';
import {
  WALLET_REPO,
  WALLET_SERVICE,
  WALLET_TRANSACTION_REPO,
  WALLET_TRANSACTION_SERVICE,
} from './wallet.constant';

@Module({
  imports: [TypeOrmModule.forFeature([Wallet, WalletTransaction]), UserModule],
  providers: [
    {
      provide: WALLET_SERVICE,
      useClass: WalletService,
    },
    {
      provide: WALLET_TRANSACTION_SERVICE,
      useClass: WalletTransactionService,
    },
    {
      provide: WALLET_REPO,
      useClass: WalletRepo,
    },
    {
      provide: WALLET_TRANSACTION_REPO,
      useClass: WalletTransactionRepo,
    },
  ],
  exports: [WALLET_SERVICE, WALLET_TRANSACTION_SERVICE],
  controllers: [WalletController],
})
export class WalletModule {}
