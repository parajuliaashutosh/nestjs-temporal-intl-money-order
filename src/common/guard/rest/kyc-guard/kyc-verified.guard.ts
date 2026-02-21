import { KYCStatus } from '@/src/common/enum/kyc-status.enum';
import { Role } from '@/src/common/enum/role.enum';
import { SupportedCountry } from '@/src/common/enum/supported-country.enum';
import { AppException } from '@/src/common/exception/app.exception';
import { AUTH_SERVICE } from '@/src/modules/auth/auth.constant';
import type { AuthContract } from '@/src/modules/auth/contract/auth.contract';
import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import type { Request } from 'express';

@Injectable()
export class KycVerifiedGuard implements CanActivate {
  private readonly logger = new Logger(KycVerifiedGuard.name);
  constructor(
    @Inject(AUTH_SERVICE) private readonly authService: AuthContract,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const countryCode = request.headers['x-country-code'] as SupportedCountry;

    const payload = request.user;

    this.logger.debug('Request user jwt payload', payload);

    try {
      const userId = payload?.userId;

      if (payload?.role != Role.USER) return true;

      const auth = await this.authService.getAuthByUserIdAndCountry(
        userId,
        countryCode,
      );

      if (!auth) {
        throw AppException.unauthorized('AUTH_NOT_FOUND');
      }

      // in entity country and auth combines is unique, so we can check using like [0]
      if (auth?.users?.[0]?.kycStatus === KYCStatus.VERIFIED) {
        return true;
      }

      return false;
    } catch (err: any) {
      Logger.error(`Error in KycVerifiedGuard: ${err}`, KycVerifiedGuard.name);
      throw err;
    }
  }
}
