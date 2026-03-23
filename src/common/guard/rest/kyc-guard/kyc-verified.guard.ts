import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { AUTH_SERVICE } from '@/src/modules/auth/auth.constant';
import type { AuthContract } from '@/src/modules/auth/contract/auth.contract';
import { CACHE_CLIENT } from '@/src/modules/cache/cache.constant';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';
import { createClient } from 'redis';

@Injectable()
export class KycVerifiedGuard implements CanActivate {
  private readonly logger = new Logger(KycVerifiedGuard.name);

  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthContract,
    @Inject(CACHE_CLIENT)
    private readonly cacheClient: ReturnType<typeof createClient>,
  ) {}

  /**
   * Guard Flow:
   *
   * 1. Skip check for non-USER roles (admin, etc.)
   * 2. Check cache for invalidated version:
   *    - If token version <= invalidatedVersion → token is stale → query DB for latest KYC
   * 3. If token is fresh (not invalidated):
   *    - Trust kycStatus in JWT payload (avoid DB hit)
   * 4. queryAndVerifyKYCStatus:
   *    - Fetches latest user from DB
   *    - Throws specific AppException based on KYC status
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const countryCode = request.headers['x-country-code'] as SupportedCountry;
    const payload = request.user;

    this.logger.debug('KycVerifiedGuard payload', payload);

    // Non-user roles bypass KYC check entirely
    if (payload?.role !== Role.USER) return true;

    const userId = payload?.user?.userId;

    try {
      const isTokenStale = await this.isTokenInvalidated(
        userId,
        payload?.user?.version,
      );

      if (isTokenStale) {
        // Token was invalidated (e.g. KYC status changed by admin)
        // Must query DB to get latest KYC status
        this.logger.debug(`Token stale for userId: ${userId}, querying DB`);
        return await this.queryAndVerifyKYCStatus(userId, countryCode);
      }

      // Token is fresh — trust the JWT payload to avoid DB hit
      if (payload?.user?.kycStatus === KYCStatus.VERIFIED) {
        return true;
      }

      // Token is fresh but KYC not verified in payload → query DB as source of truth
      return await this.queryAndVerifyKYCStatus(userId, countryCode);
    } catch (err: any) {
      this.logger.error(`KycVerifiedGuard error for userId ${userId}: ${err}`);
      throw err;
    }
  }

  private async isTokenInvalidated(
    userId: string,
    tokenVersion: number,
  ): Promise<boolean> {
    const cached = await this.cacheClient.get(
      `user_invalidated_version:${userId}`,
    );

    if (!cached) return false;

    return tokenVersion <= parseInt(cached as string, 10);
  }

  private async queryAndVerifyKYCStatus(
    userId: string,
    countryCode: SupportedCountry,
  ): Promise<boolean> {
    const auth = await this.authService.getAuthByUserIdAndCountry(
      userId,
      countryCode,
    );

    if (!auth) {
      throw AppException.unauthorized('AUTH_NOT_FOUND');
    }

    const user = auth?.users?.[0];

    switch (user?.kycStatus) {
      case KYCStatus.VERIFIED:
        return true;

      case KYCStatus.REJECTED:
        throw AppException.forbidden('KYC_REJECTED');

      case KYCStatus.PENDING:
        throw AppException.forbidden('KYC_PENDING');

      default:
        throw AppException.forbidden('KYC_UNKNOWN_STATUS');
    }
  }
}
