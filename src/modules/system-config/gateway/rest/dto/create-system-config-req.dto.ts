import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { SupportedCurrency } from '@/src/common/enum/supported-currency.enum';
import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsPositive } from 'class-validator';

export class CreateSystemConfigReqDTO {
  @ApiProperty({
    description: 'Currency code',
    enum: SupportedCurrency,
    example: SupportedCurrency.USD,
  })
  @IsNotEmpty()
  @IsEnum(SupportedCurrency)
  currency: SupportedCurrency;

  @ApiProperty({
    description: 'Exchange rate (positive number)',
    example: 1.0,
    minimum: 0.01,
  })
  @IsNotBlank()
  @IsNumber()
  @IsPositive({ message: 'Exchange rate must be a positive number' })
  exchangeRate: number;
}
