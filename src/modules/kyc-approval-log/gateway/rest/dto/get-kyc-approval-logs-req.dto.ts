import { PaginationQueryDTO } from '@/src/common/dto/pagination-query.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class GetKycApprovalLogsReqDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Filter by the reviewed user id',
    example: 'uuid-here',
  })
  @IsOptional()
  @IsString()
  userId?: string;
}
