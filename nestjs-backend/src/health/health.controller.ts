import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { HealthService, HealthStatus } from './health.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly healthService: HealthService) {}

  @Get()
  @ApiOperation({ summary: 'Check application and database health' })
  @ApiResponse({
    status: 200,
    description: 'Application is healthy',
    schema: {
      example: {
        status: 'healthy',
        timestamp: '2024-01-01T00:00:00.000Z',
        database: {
          status: 'up',
          message: 'Database is reachable',
          responseTimeMs: 5,
        },
      },
    },
  })
  @ApiResponse({
    status: 503,
    description: 'Application is unhealthy — database is unreachable',
    schema: {
      example: {
        status: 'unhealthy',
        timestamp: '2024-01-01T00:00:00.000Z',
        database: {
          status: 'down',
          message: 'Database unreachable',
          responseTimeMs: 120,
        },
      },
    },
  })
  async check(@Res() res: Response): Promise<Response<HealthStatus>> {
    const health = await this.healthService.getHealth();
    const statusCode =
      health.status === 'healthy' ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;
    return res.status(statusCode).json(health);
  }
}
