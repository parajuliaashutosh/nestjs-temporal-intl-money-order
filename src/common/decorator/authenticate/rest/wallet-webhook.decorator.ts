import { WalletWebhookGuard } from '@/src/common/guard/rest/wallet-webhook.guard';
import { applyDecorators, UseGuards } from '@nestjs/common';

export function WalletWebhookAuth() {
  return applyDecorators(UseGuards(WalletWebhookGuard));
}
