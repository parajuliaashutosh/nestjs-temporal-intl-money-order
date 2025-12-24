import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import {
    IsOptional,
    IsString
} from 'class-validator';

export class CreateAdminDTO {
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
