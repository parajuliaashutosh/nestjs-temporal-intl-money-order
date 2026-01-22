import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNumber, IsOptional, IsPositive } from 'class-validator';

export class CreateReceiverReqDTO {
  @ApiProperty({
    description: 'Receiver first name',
    example: 'Jane',
  })
  @IsNotBlank()
  firstName: string;

  @ApiPropertyOptional({
    description: 'Receiver middle name',
    example: 'Marie',
  })
  @IsOptional()
  middleName?: string;

  @ApiProperty({
    description: 'Receiver last name',
    example: 'Smith',
  })
  @IsNotBlank()
  lastName: string;

  @ApiPropertyOptional({
    description: 'Receiver email address',
    example: 'jane.smith@example.com',
  })
  @IsOptional()
  email?: string;

  @ApiProperty({
    description: 'Receiver phone number',
    example: '+1234567890',
  })
  @IsNotBlank()
  phoneNumber: string;

  @ApiPropertyOptional({
    description: 'Receiver physical address',
    example: '123 Main St, City, Country',
  })
  @IsOptional()
  address?: string;

  @ApiProperty({
    description: 'Receiver bank name',
    example: 'Example Bank',
  })
  @IsNotBlank()
  bankName: string;

  @ApiProperty({
    description: 'Receiver bank account number',
    example: '1234567890',
  })
  @IsNotBlank()
  @IsNumber()
  @IsPositive()
  bankAccountNumber: string;
}
