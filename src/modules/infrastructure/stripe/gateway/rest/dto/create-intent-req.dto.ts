import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { IsPositive } from 'class-validator';

export class CreateIntentReqDTO {
  @IsNotBlank()
  @IsPositive()
  amount: number;

  @IsNotBlank()
  idempotencyKey: string;
}
