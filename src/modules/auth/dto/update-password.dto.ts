import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { MinLength } from 'class-validator';

export class UpdatePasswordDTO {
  @IsNotBlank()
  currentPassword: string;

  @IsNotBlank()
  @MinLength(8)
  newPassword: string;
}
