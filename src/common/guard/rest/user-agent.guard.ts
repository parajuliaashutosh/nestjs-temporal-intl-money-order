import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class UserAgentGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request: Request = context.switchToHttp().getRequest();
    const userAgent = request.headers['user-agent'] || '';
    const restrictedMethods = ['POST', 'PATCH', 'DELETE', 'PUT'];

    if (restrictedMethods.includes(request.method)) {
      if (!userAgent.includes('Mozilla')) {
        // If User-Agent doesn't contain Mozilla, check x-api-key
        if (
          request.headers['x-api-key'] !== this.configService.get('API_KEY')
        ) {
          throw new ForbiddenException('Forbidden: Invalid User-Agent');
        }
      }
    }
    return true;
  }
}
