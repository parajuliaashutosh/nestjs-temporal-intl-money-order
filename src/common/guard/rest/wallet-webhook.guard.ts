import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';
import { AppException } from '../../exception/app.exception';

@Injectable()
export class WalletWebhookGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();

    const webhookKey = this.extractWebhookKeyFromHeader(request);

    if (!webhookKey) {
      throw AppException.unauthorized('MISSING_WEBHOOK_KEY');
    }

    const validWebhookKey =
      this.configService.get<string>('WALLET_WEBHOOK_KEY');

    if (!validWebhookKey) {
      throw AppException.internalServerError('WEBHOOK_KEY_NOT_CONFIGURED');
    }

    if (webhookKey !== validWebhookKey) {
      throw AppException.unauthorized('INVALID_WEBHOOK_KEY');
    }

    return true;
  }

  private extractWebhookKeyFromHeader(request: Request): string | undefined {
    // Alternative: Check for webhook key in custom header
    const webhookKeyHeader = request.headers['x-webhook-key'] as
      | string
      | undefined;
    if (webhookKeyHeader) {
      return webhookKeyHeader;
    }

    return undefined;
  }
}
