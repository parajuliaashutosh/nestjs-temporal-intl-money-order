import { AuthenticationGuard } from '@/src/common/guard/rest/authentication.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth } from '@nestjs/swagger';

export function Authenticate() {
  return applyDecorators(
    ApiBearerAuth('JWT-auth'),
    ApiCookieAuth('accessToken'),
    UseGuards(AuthenticationGuard),
  );
}
