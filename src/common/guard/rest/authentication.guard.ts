import { TokenPayload, TokenService } from '@/src/modules/auth/service/token/token.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable
} from '@nestjs/common';
import type { Request } from 'express';
import { UserContext, UserContextStorage } from '../../context/user.context';
import { Role } from '../../enum/role.enum';
import { SupportedCountry } from '../../enum/supported-country.enum';
import { AppException } from '../../exception/app.exception';

export interface ReqUserPayload extends TokenPayload {
  userId?: string;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const countryCode = request.headers['x-country-code'] as SupportedCountry;

    if (!countryCode) {
      throw AppException.badRequest('MISSING_COUNTRY_HEADER');
    }
    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw AppException.unauthorized('NOT_AUTHORIZED');
    }
    try {
      const payload = this.jwtService.verifyAccessToken(token);

      const userPayload: ReqUserPayload = {
        ...payload,
        userId: payload.user.find(user => user.country == countryCode)?.userId || undefined,
      }
      request.user = userPayload;

      const userContext = new UserContext(
      {
        key: payload.key,
        id: payload.id,
        role: payload.role as Role,
        user: payload.user,
        userId: payload.user.find(user => user.country == countryCode)?.userId,
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
