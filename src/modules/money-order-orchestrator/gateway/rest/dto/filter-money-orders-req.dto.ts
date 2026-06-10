import { PaginationQueryDTO } from '@/src/common/dto/pagination-query.dto';
import {
  MoneyOrderDeliveryStatus,
  MoneyOrderStatus,
} from '@/src/common/enum/money-order-status.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsUUID } from 'class-validator';

export class FilterMoneyOrdersReqDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({
    description: 'Filter by the sending user id',
    example: 'user-uuid-here',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiPropertyOptional({
    description: 'Filter by money order status',
    enum: MoneyOrderStatus,
  })
  @IsOptional()
  @IsEnum(MoneyOrderStatus)
  status?: MoneyOrderStatus;

  @ApiPropertyOptional({
    description: 'Filter by delivery status',
    enum: MoneyOrderDeliveryStatus,
  })
  @IsOptional()
  @IsEnum(MoneyOrderDeliveryStatus)
  deliveryStatus?: MoneyOrderDeliveryStatus;
}
