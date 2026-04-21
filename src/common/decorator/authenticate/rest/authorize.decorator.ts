import { Role } from '@/src/common/enum/role.enum';
import { AuthenticationGuard } from '@/src/common/guard/rest/authentication.guard';
import { AuthorizationGuard } from '@/src/common/guard/rest/authorization.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';
import { ApiOperation } from '@nestjs/swagger';

export const ROLES_KEY = 'roles';

export function Authorize(roles: Role[]) {
  return applyDecorators(
    ApiOperation({ description: `**Required roles:** ${roles.join(', ')}` }),
    UseGuards(AuthenticationGuard, AuthorizationGuard),
  );
}
