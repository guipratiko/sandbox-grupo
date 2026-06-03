import { Response } from 'express';

export function jsonError(res: Response, status: number, message: string): void {
  res.status(status).json({ status: 'error', message });
}

export function jsonSuccess(res: Response, data: unknown, status = 200): void {
  res.status(status).json({ status: 'success', data });
}

export function sendEvolutionError(res: Response, err: unknown): void {
  const status = typeof (err as { status?: number }).status === 'number' ? (err as { status: number }).status : 500;
  const message = err instanceof Error ? err.message : 'Erro ao falar com a Evolution GO';
  jsonError(res, status >= 400 && status < 600 ? status : 500, message);
}
