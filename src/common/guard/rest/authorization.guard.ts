import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../../decorator/authenticate/rest/authorize.decorator';
import { Role } from '../../enum/role.enum';
import { AppException } from '../../exception/app.exception';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true;
    const { user } = context.switchToHttp().getRequest<Request>();

    if (!user) throw AppException.forbidden('NOT_AUTHORIZED');

    if (!requiredRoles.includes(user.role))
      throw AppException.forbidden('NOT_PERMITTED');
    return true;
  }
}
