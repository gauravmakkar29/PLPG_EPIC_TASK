import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

interface HealthResponse {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  uptime: number;
  database: 'connected' | 'disconnected';
}

export async function healthCheck(_req: Request, res: Response<HealthResponse>): Promise<void> {
  let databaseStatus: 'connected' | 'disconnected' = 'disconnected';

  try {
    await prisma.$queryRaw`SELECT 1`;
    databaseStatus = 'connected';
  } catch {
    databaseStatus = 'disconnected';
  }

  const response: HealthResponse = {
    status: databaseStatus === 'connected' ? 'healthy' : 'unhealthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: databaseStatus,
  };

  res.status(response.status === 'healthy' ? 200 : 503).json(response);
}
