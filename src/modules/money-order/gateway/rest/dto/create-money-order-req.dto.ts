import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateMoneyOrderReqDTO {
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  sendingAmount: number;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  receiverAmount: number;

  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  exchangeRate: number;

  @IsNotBlank()
  receiverId: string;
}
