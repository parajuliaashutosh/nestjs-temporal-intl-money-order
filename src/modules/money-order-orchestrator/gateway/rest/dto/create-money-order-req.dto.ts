import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive } from 'class-validator';

export class CreateMoneyOrderReqDTO {
  @ApiProperty({
    description: 'Amount to send (in sender currency)',
    example: 1000,
    minimum: 1,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  sendingAmount: number;

  @ApiProperty({
    description: 'Amount receiver will get (in receiver currency)',
    example: 850,
    minimum: 1,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  receiverAmount: number;

  @ApiProperty({
    description: 'Exchange rate applied',
    example: 0.85,
    minimum: 0.01,
  })
  @IsNumber({ maxDecimalPlaces: 0 })
  @IsPositive()
  exchangeRate: number;

  @ApiProperty({
    description: 'Receiver ID (UUID)',
    example: 'receiver-uuid-here',
  })
  @IsNotBlank()
  receiver: string;
}
