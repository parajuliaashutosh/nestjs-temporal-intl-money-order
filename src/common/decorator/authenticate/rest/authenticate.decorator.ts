import { AuthenticationGuard } from '@/src/common/guard/rest/authentication.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';

export function Authenticate() {
  return applyDecorators(UseGuards(AuthenticationGuard));
}
