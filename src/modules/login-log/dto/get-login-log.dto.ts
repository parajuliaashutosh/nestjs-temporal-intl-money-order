import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { IsNumber, IsOptional, IsString } from 'class-validator';

export class GetLoginLogDTO {
  @IsNotBlank()
  @IsString()
  authId: string;

  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  search?: string;
}
