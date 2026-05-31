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
    example: 140.0,
    minimum: 90,
    maximum: 160,
  })
  @IsNumber()
  @IsPositive({ message: 'Exchange rate must be a positive number' })
  exchangeRate: number;
}
