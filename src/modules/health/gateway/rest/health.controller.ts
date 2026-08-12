import { AppException } from '@/src/common/exception/app.exception';
import { RestResponse } from '@/src/common/response-type/rest/rest-response';
import { Controller, Get, Logger } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('health')
@Controller('health')
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(private readonly dataSource: DataSource) {}

  @Get()
  @ApiOperation({
    summary: 'Health check',
    description: 'Check if the application and its database connection are up.',
  })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        success: true,
        message: 'Application is healthy',
        data: { database: 'up' },
      },
    },
  })
  async check() {
    try {
      await this.dataSource.query('SELECT 1');
    } catch (error) {
      this.logger.error('Database health check failed', error as Error);
      throw AppException.internalServerError('DATABASE_UNAVAILABLE');
    }

    return RestResponse.builder()
      .setSuccess(true)
      .setMessage('Application is healthy')
      .setData({ database: 'up' })
      .build();
  }
}
