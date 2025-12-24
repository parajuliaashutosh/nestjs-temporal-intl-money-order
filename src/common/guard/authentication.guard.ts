import { TokenService } from '@/src/modules/auth/service/token/token.service';
import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(
    private tokenService: TokenService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException("NOT_AUTHORIZED");
    }
    try {
      const payload = this.tokenService.verifyAccessToken(token);

      request.user = payload;
    } catch {
      throw new UnauthorizedException("ACCESS_TOKEN_EXPIRED");
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const cookies: unknown = request.cookies;
    if (typeof cookies !== 'object' || cookies === null) return undefined;

    const cookieRecord = cookies as Record<string, unknown>;
    const accessToken =
      typeof cookieRecord.accessToken === 'string' ? cookieRecord.accessToken : undefined;
    const refreshToken =
      typeof cookieRecord.refreshToken === 'string' ? cookieRecord.refreshToken : undefined;

    if (!accessToken && refreshToken)
      throw new UnauthorizedException('TOKEN_EXPIRED');
    return accessToken;
  }
}
