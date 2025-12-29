import { TokenService } from '@/src/modules/auth/service/token/token.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { UserContext, UserContextStorage } from '../../context/user.context';
import { Role } from '../../enum/role.enum';
import { AppException } from '../../exception/app.exception';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('NOT_AUTHORIZED');
    }
    try {
      const payload = this.jwtService.verifyAccessToken(token);

      request.user = payload;

      const userContext = new UserContext(
      {
        key: payload.key,
        id: payload.id,
        role: payload.role as Role,
        userId: payload.userId,
        adminId: payload.adminId,
        tokenPayload: payload,
      }
      );
      UserContextStorage.run(userContext, () => true);
    } catch {
      throw AppException.unauthorized('INVALID_TOKEN');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const cookies: unknown = request.cookies;

    let accessToken: string | undefined;
    let refreshToken: string | undefined;

    if (typeof cookies === 'object' && cookies !== null) {
      const c = cookies as Record<string, unknown>;
      if (typeof c.accessToken === 'string') accessToken = c.accessToken;
      if (typeof c.refreshToken === 'string') refreshToken = c.refreshToken;
    }

    if (!accessToken && refreshToken)
      throw AppException.unauthorized('TOKEN_EXPIRED');
    return accessToken;
  }
}
