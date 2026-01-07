import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { IsNumber, IsOptional } from 'class-validator';

export class GetReceiverDTO {
  @IsNotBlank()
  userId: string;

  @IsNumber()
  page: number;
  @IsNumber()
  limit: number;

  @IsOptional()
  search?: string;
}
