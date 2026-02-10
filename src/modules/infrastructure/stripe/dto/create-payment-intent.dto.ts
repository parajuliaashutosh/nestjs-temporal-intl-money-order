import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { IsEnum } from 'class-validator';

export class CreateIntentDTO {
  //amount in cents, so $10 would be 1000
  @IsNotBlank()
  amount: number;

  @IsNotBlank()
  idempotencyKey: string;

  @IsEnum(SupportedCurrency)
  supportedCurrency: SupportedCurrency;
}
