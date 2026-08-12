import {
  TokenPayload,
  TokenService,
  TokenUser,
} from '@/src/modules/auth/service/token/token.service';
import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';
import { UserContext, UserContextStorage } from '../../context/user.context';
import { Role } from '../../enum/role.enum';
import { SupportedCountry } from '../../enum/supported-country.enum';
import { AppException } from '../../exception/app.exception';
import { HEADER_COUNTRY_CODE_KEY } from '../../util/constant';

export interface ReqUserPayload extends TokenPayload {
  user: TokenUser;
}

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: TokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const rawCountryCode = request.headers['x-country-code'] as string;

    if (!rawCountryCode) {
      throw AppException.badRequest('MISSING_COUNTRY_HEADER');
    }

    const countryCode = rawCountryCode.toUpperCase() as SupportedCountry;

    if (!Object.values(SupportedCountry).includes(countryCode)) {
      throw AppException.badRequest(
        `Invalid ${HEADER_COUNTRY_CODE_KEY}. Allowed values: ${Object.values(SupportedCountry).join(', ')}`,
      );
    }

    const token = this.extractTokenFromHeader(request);
    if (!token) {
      throw AppException.unauthorized('NOT_AUTHORIZED');
    }

    let payload: TokenPayload;
    try {
      payload = this.jwtService.verifyAccessToken(token);
    } catch {
      throw AppException.unauthorized('INVALID_TOKEN');
    }

    const linkedUser = payload.users.find(
      (user) => user.country == countryCode,
    );

    // USER-role tokens must have an account linked to the requested
    // country; admins aren't in payload.users at all, so they're exempt.
    if (payload.role === Role.USER && !linkedUser) {
      throw AppException.unauthorized('NO_LINKED_ACCOUNT_FOR_COUNTRY');
    }

    const userPayload: ReqUserPayload = {
      ...payload,
      user: linkedUser,
    };
    request.user = userPayload;

    const userContext = new UserContext({
      key: payload.key,
      id: payload.id,
      role: payload.role,
      users: payload.users,
      user: userPayload.user,
      adminId: payload.adminId,
      tokenPayload: payload,
    });
    UserContextStorage.run(userContext, () => true);

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
