import { Injectable, Logger } from '@nestjs/common';
import prisma from '@juliana-gaspar/database';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  async isDatabaseHealthy(): Promise<boolean> {
    try {
      await prisma.$queryRaw`SELECT 1`;
      return true;
    } catch (error) {
      this.logger.error('Database health check failed', error);
      return false;
    }
  }
}
