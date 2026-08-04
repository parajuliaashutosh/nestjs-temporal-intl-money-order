import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { IsEnum, IsNumber, IsOptional } from 'class-validator';

export class GetSystemConfigLogDTO {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsOptional()
  @IsEnum(SupportedCountry)
  countryCode?: SupportedCountry;
}
