import { IsOptional, IsString, IsNumber } from 'class-validator';

export class GetKycApprovalLogDTO {
  @IsNumber()
  page: number;

  @IsNumber()
  limit: number;

  @IsOptional()
  @IsString()
  userId?: string;
}
