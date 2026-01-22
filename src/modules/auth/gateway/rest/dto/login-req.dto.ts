import { IsNotBlank } from '@/src/common/decorator/validator/is-not-blank.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginReqDTO {
  @ApiProperty({
    description: 'Username or email for authentication',
    example: 'john.doe@example.com',
  })
  @IsNotBlank()
  username: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    format: 'password',
  })
  @IsNotBlank()
  password: string;
}
