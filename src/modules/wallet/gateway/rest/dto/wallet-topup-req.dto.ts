import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class WalletTopUpReqDTO {
  // webhook id
  @IsNotBlank()
  id: string;

  @IsUUID('all', { message: 'Invalid user ID format' })
  userId: string;

  // is in cents
  @IsNumber()
  @IsPositive({ message: 'Top-up amount must be a positive number' })
  amount: number;
}