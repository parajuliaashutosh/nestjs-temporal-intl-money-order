import { PaginationQueryDTO } from '@/src/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetLoginLogsReqDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Search term to filter login logs',
    example: 'chrome',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
