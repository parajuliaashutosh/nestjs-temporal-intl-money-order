import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { ApiProperty } from '@nestjs/swagger';
import { MinLength } from 'class-validator';

export class UpdatePasswordReqDTO {
  @ApiProperty({
    description: 'Current password of the authenticated account',
    example: 'SecurePassword123!',
    format: 'password',
  })
  @IsNotBlank()
  currentPassword: string;

  @ApiProperty({
    description:
      'New password. Cannot match any of the last 3 passwords used by the account.',
    example: 'EvenMoreSecurePassword456!',
    format: 'password',
    minLength: 8,
  })
  @IsNotBlank()
  @MinLength(8)
  newPassword: string;
}
