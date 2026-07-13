import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNumber, IsPositive, IsUUID } from 'class-validator';

export class WalletTopUpReqDTO {
  @ApiProperty({
    description: 'Unique transaction ID',
    example: 'webhook-txn-12345',
  })
  @IsNotBlank()
  id: string;

  @ApiProperty({
    description: 'User UUID',
    example: 'user-uuid-here',
    format: 'uuid',
  })
  @IsUUID('all', { message: 'Invalid user ID format' })
  userId: string;

  @ApiProperty({
    description: 'Country - determines the wallet currency',
    enum: SupportedCountry,
  })
  @IsEnum(SupportedCountry, { message: 'Invalid country format' })
  country: SupportedCountry;

  @ApiProperty({
    description: 'Top-up amount in cents',
    example: 10000,
    minimum: 1,
  })
  // is in cents
  @IsNumber()
  @IsPositive({ message: 'Top-up amount must be a positive number' })
  amount: number;
}
