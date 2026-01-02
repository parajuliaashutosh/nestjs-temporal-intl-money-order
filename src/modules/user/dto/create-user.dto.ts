import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import {
  IsEnum,
  IsOptional,
  IsString
} from 'class-validator';

export class CreateUserDTO {
  @IsNotBlank()
  @IsString()
  firstName: string;

  @IsOptional()
  @IsString()
  middleName?: string;

  @IsNotBlank()
  @IsString()
  lastName: string;


  @IsNotBlank()
  @IsEnum(SupportedCountry)
  country: SupportedCountry;
}
