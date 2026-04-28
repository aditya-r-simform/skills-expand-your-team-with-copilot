import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface DatabaseHealth {
  status: 'up' | 'down';
  message: string;
  responseTimeMs: number;
}

export interface HealthStatus {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  database: DatabaseHealth;
}

@Injectable()
export class HealthService {
  constructor(private readonly prisma: PrismaService) {}

  async checkDatabase(): Promise<DatabaseHealth> {
    const start = Date.now();
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'up',
        message: 'Database is reachable',
        responseTimeMs: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'down',
        message: error instanceof Error ? error.message : 'Database unreachable',
        responseTimeMs: Date.now() - start,
      };
    }
  }

  async getHealth(): Promise<HealthStatus> {
    const database = await this.checkDatabase();
    return {
      status: database.status === 'up' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      database,
    };
  }
}
