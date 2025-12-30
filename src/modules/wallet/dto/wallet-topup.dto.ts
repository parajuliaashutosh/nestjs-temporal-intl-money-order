import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { IsEnum, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class WalletTopUpDTO {
  // webhook id
  @IsNotBlank()
  id: string;

  @IsUUID('all', { message: 'Invalid user ID format' })
  userId: string;

  @IsEnum(SupportedCountry, { message: 'Invalid country format' })
  country: SupportedCountry;

  // is in cents
  @IsNumber()
  @IsPositive({ message: 'Top-up amount must be a positive number' })
  amount: number;
}
