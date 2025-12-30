import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import {
    WalletHistoryType,
    WalletTxnDirection,
} from '@/src/common/enum/wallet.enum';
import { numberRegex } from '@/src/common/util/constant';
import { IsEnum, IsNotEmpty, Matches } from 'class-validator';

export class CreateWalletTransactionDTO {
  @IsEnum(WalletTxnDirection)
  direction: WalletTxnDirection;

  @IsEnum(WalletHistoryType)
  historyType: WalletHistoryType;


  @IsNotEmpty()
  @Matches(numberRegex, { message: 'Amount must be a string representing an integer (in cents)' })
  amount: string;

  @IsNotEmpty()
  @Matches(numberRegex, { message: 'balanceAfter must be a string representing an integer (in cents)' })
  balanceAfter: string;

  @IsNotBlank()
  idemPotent: string;
}
