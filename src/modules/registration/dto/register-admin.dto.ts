import { IsEnumExcluding } from '@/src/common/decorator/validator/is-enum-excluding.decorator';
import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { Role } from '@/src/common/enum/role.enum';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength
} from 'class-validator';

export class RegisterAdminDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @MinLength(8)
  @IsNotEmpty()
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsEnumExcluding(Role, [Role.SUDO_ADMIN, Role.USER])
  @IsNotEmpty()
  role: Role;

  @IsNotBlank()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotBlank()
  @IsString()
  lastName: string;
}
