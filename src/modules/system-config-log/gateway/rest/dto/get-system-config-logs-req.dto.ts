import { PaginationQueryDTO } from '@/src/common/dto/pagination-query.dto';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export class GetSystemConfigLogsReqDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Filter by country code',
    enum: SupportedCountry,
  })
  @IsOptional()
  @IsEnum(SupportedCountry)
  countryCode?: SupportedCountry;
}
