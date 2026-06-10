import { PaginationQueryDTO } from '@/src/common/dto/pagination-query.dto';
import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';

export class FilterUsersReqDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Search by first/middle/last name, email or phone number',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filter by auth id',
    example: 'auth-uuid-here',
  })
  @IsOptional()
  @IsUUID()
  authId?: string;

  @ApiPropertyOptional({
    description: 'Filter by KYC status',
    enum: KYCStatus,
  })
  @IsOptional()
  @IsEnum(KYCStatus)
  kycStatus?: KYCStatus;

  @ApiPropertyOptional({
    description: 'Filter by country',
    enum: SupportedCountry,
  })
  @IsOptional()
  @IsEnum(SupportedCountry)
  country?: SupportedCountry;
}
