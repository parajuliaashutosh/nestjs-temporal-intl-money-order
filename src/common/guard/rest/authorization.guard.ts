import {
    CanActivate,
    ExecutionContext,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { ROLES_KEY } from '../../decorator/authenticate/rest/authorization.decorator';
import { Role } from '../../enum/role.enum';

@Injectable()
export class AuthorizationGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext) {
    const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) return true; //if no roles are specified then pass through the guard
    const { user } = context.switchToHttp().getRequest<Request>();

    if (!user) throw new ForbiddenException("NOT_AUTHORIZED");

    if (!requiredRoles.some((role) => user.role?.includes(role)))
      throw new ForbiddenException("NOT_PERMITTED");
    return true;
  }
}
