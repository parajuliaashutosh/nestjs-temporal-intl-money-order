import { KycVerifiedGuard } from '@/src/common/guard/rest/kyc-guard/kyc-verified.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';

export function KycVerified() {
  return applyDecorators(UseGuards(KycVerifiedGuard));
}
