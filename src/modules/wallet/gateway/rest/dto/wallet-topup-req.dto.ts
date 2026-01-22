import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, IsUUID } from 'class-validator';

export class WalletTopUpReqDTO {
  @ApiProperty({
    description: 'Webhook transaction ID',
    example: 'webhook-txn-12345',
  })
  // webhook id
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
    description: 'Top-up amount in cents',
    example: 10000,
    minimum: 1,
  })
  // is in cents
  @IsNumber()
  @IsPositive({ message: 'Top-up amount must be a positive number' })
  amount: number;
}
