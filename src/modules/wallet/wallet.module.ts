import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from '../user/user.module';
import { WalletTransaction } from './entity/wallet-transaction.entity';
import { Wallet } from './entity/wallet.entity';
import { WalletController } from './gateway/rest/wallet.controller';
import { WalletTransactionService } from './service/wallet-transaction.service';
import { WalletService } from './service/wallet.service';
import { WALLET_SERVICE, WALLET_TRANSACTION_SERVICE } from './wallet.constant';

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
  ],
  exports: [WALLET_SERVICE, WALLET_TRANSACTION_SERVICE],
  controllers: [WalletController],
})
export class WalletModule {}
