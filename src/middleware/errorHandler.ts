import type { Request, Response, NextFunction } from 'express';

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  const message = err instanceof Error ? err.message : 'Erro interno';
  const status = typeof (err as { status?: number }).status === 'number' ? (err as { status: number }).status : 500;
  console.error('[Grupo-Flow]', message);
  res.status(status).json({
    status: 'error',
    message,
  });
}
