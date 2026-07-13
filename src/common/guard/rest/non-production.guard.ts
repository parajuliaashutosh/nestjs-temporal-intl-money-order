import { AppException } from '@/src/common/exception/app.exception';
import { CanActivate, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class NonProductionGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(): boolean {
    if (this.configService.get('NODE_ENV') === 'PRODUCTION') {
      // 404 instead of 403 so the endpoint's existence isn't leaked in production
      throw AppException.notFound('NOT_FOUND');
    }

    return true;
  }
}
