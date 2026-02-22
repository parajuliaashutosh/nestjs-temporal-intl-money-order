import { AuthenticationGuard } from '@/src/common/guard/rest/authentication.guard';
import { AuthorizationGuard } from '@/src/common/guard/rest/authorization.guard';
import { KycVerifiedGuard } from '@/src/common/guard/rest/kyc-guard/kyc-verified.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';

export function KycVerified() {
  return applyDecorators(
    UseGuards(AuthenticationGuard, AuthorizationGuard, KycVerifiedGuard),
  );
}
