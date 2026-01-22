import { IsEnumExcluding } from '@/src/common/decorator/validator/is-enum-excluding.decorator';
import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { Role } from '@/src/common/enum/role.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class RegisterAdminDTO {
  @ApiProperty({
    description: 'Admin email address',
    example: 'admin@example.com',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'Admin password (minimum 8 characters)',
    example: 'SecureAdminPass123!',
    minLength: 8,
    format: 'password',
  })
  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({
    description: 'Admin phone number',
    example: '+1234567890',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({
    description: 'Admin role (cannot be SUDO_ADMIN or USER)',
    enum: Role,
    example: Role.ADMIN,
  })
  @IsEnumExcluding(Role, [Role.SUDO_ADMIN, Role.USER])
  @IsNotEmpty()
  role: Role;

  @ApiProperty({
    description: 'Admin first name',
    example: 'Jane',
  })
  @IsNotBlank()
  @IsString()
  firstName: string;

  @ApiPropertyOptional({
    description: 'Admin middle name',
    example: 'Marie',
  })
  @IsOptional()
  @IsString()
  middleName?: string;

  @ApiProperty({
    description: 'Admin last name',
    example: 'Smith',
  })
  @IsNotBlank()
  @IsString()
  lastName: string;
}
