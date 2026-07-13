import { AppException } from '@/src/common/exception/app.exception';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  RawBodyRequest,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import type { Request } from 'express';

/**
 * Verifies a `x-dev-signature: sha256=<hex hmac>` header against the raw
 * request body using WALLET_DEV_TOPUP_SIGNING_SECRET, the same way Stripe's
 * own webhook signing works - except this secret is static and set once by
 * us, instead of rotating every time `stripe listen` restarts locally.
 */
@Injectable()
export class DevWebhookSignatureGuard implements CanActivate {
  private readonly logger = new Logger(DevWebhookSignatureGuard.name);

  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: RawBodyRequest<Request> = context
      .switchToHttp()
      .getRequest();

    const signatureHeader = request.headers['x-dev-signature'];
    const rawBody = request.rawBody;

    if (!signatureHeader || typeof signatureHeader !== 'string') {
      throw AppException.unauthorized('Missing x-dev-signature header');
    }

    if (!rawBody) {
      this.logger.error('Raw body unavailable for dev signature verification');
      throw AppException.badRequest('Invalid request body');
    }

    const secret = this.configService.getOrThrow<string>(
      'WALLET_DEV_TOPUP_SIGNING_SECRET',
    );

    const providedSignature = signatureHeader.startsWith('sha256=')
      ? signatureHeader.slice('sha256='.length)
      : signatureHeader;

    const expectedSignature = createHmac('sha256', secret)
      .update(rawBody)
      .digest('hex');

    const providedBuffer = Buffer.from(providedSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    const isValid =
      providedBuffer.length === expectedBuffer.length &&
      timingSafeEqual(providedBuffer, expectedBuffer);

    if (!isValid) {
      this.logger.warn('Invalid dev wallet top-up signature received');
      throw AppException.unauthorized('Invalid signature');
    }

    return true;
  }
}
