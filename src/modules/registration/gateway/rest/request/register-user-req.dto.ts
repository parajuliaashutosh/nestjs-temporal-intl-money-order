import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterUserReqDTO {
  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
    format: 'password',
  })
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'User phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
  })
  @IsNotBlank()
  @IsString()
  firstName: string;

  @ApiPropertyOptional({
    description: 'User middle name',
    example: 'William',
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
  })
  @IsNotBlank()
  @IsString()
  lastName: string;
}
