import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { IsString } from 'class-validator';

export class UserDeviceDataDTO {
  @IsNotBlank()
  @IsString()
  clientIp: string;

  @IsNotBlank()
  @IsString()
  userAgent: string;

  @IsNotBlank()
  @IsString()
  deviceId: string;
}
