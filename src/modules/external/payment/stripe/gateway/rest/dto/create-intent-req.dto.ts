import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsPositive, Min } from 'class-validator';

export class CreateIntentReqDTO {
  @ApiProperty({
    description:
      'Amount in cents (e.g., 1000 = $10.00). Minimum amount is 50 cents.',
    example: 1000,
    minimum: 50,
  })
  @IsNumber()
  @IsPositive()
  @Min(50, { message: 'Amount must be at least 50 cents' })
  amount: number;

  @ApiProperty({
    description:
      'Unique idempotency key to prevent duplicate charges. Use a UUID or unique transaction ID.',
    example: 'txn_abc123_1234567890',
  })
  @IsNotBlank()
  idempotencyKey: string;
}
