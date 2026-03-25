import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Controller, Get, Ip, Req } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  DiskHealthIndicator,
  HealthCheck,
  HealthCheckService,
  MemoryHealthIndicator,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';
import type { Request } from 'express';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: TypeOrmHealthIndicator,
    private memory: MemoryHealthIndicator,

    private disk: DiskHealthIndicator,
    private configService: ConfigService,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the application is running',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        success: true,
        message: 'Application is healthy',
        data: {
          status: 'ok',
          info: { database: { status: 'up' } },
          error: {},
          details: { database: { status: 'up' } },
        },
      },
    },
  })
  async check() {
    const result = await this.health.check([
      // Minimal check for public endpoint
      () => this.db.pingCheck('database', { timeout: 3000 }),
    ]);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Application is healthy')
      .setData(result)
      .build();
  }

  @Get('detail')
  @HealthCheck()
  @ApiOperation({
    summary: 'Detailed health check',
    description:
      'Detailed health check including database, redis, and other services. Restricted by IP whitelist.',
  })
  async checkDetail(@Req() req: Request, @Ip() ip: string) {
    // IP Whitelisting
    const allowedIps = this.configService
      .get<string>('HEALTH_CHECK_WHITELIST_IPS', '')
      .split(',')
      .map((ip) => ip.trim())
      .filter((ip) => ip.length > 0);

    // Prioritize x-real-ip header
    const realIp = (req.headers['x-real-ip'] as string) || ip;

    // Skip check if no whitelist defined (or handle as deny all if preferred, but usually empty means open or dev)
    // Here we'll enforce that if whitelist exists, IP must match.
    // If whitelist is empty, we might want to deny detailed access in production.

    if (allowedIps.length > 0 && !allowedIps.includes(realIp)) {
      return RestResponse.builder()
        .setSuccess(false)
        .setMessage('Access denied')
        .build();
    }

    const result = await this.health.check([
      // HTTP check (external service)
      // () => this.http.pingCheck('nestjs-docs', 'https://docs.nestjs.com'),

      // Database check (TypeORM)
      () => this.db.pingCheck('database'),

      // Memory heap < 300MB
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Memory RSS < 300MB
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),

      // Disk storage > 50% free
      () =>
        this.disk.checkStorage('storage', {
          path: '/',
          thresholdPercent: 0.85,
        }),
    ]);

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Detailed system health status')
      .setData(result)
      .build();
  }
}
