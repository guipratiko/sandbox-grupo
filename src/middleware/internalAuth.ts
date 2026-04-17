import type { Request, Response, NextFunction } from 'express';
import { env } from '../config/env';

/**
 * Rotas internas (ex.: agendamentos) devem enviar o mesmo segredo do Backend:
 * header `x-internal-key` ou `x-grupo-flow-internal-key`.
 */
export function requireInternalKey(req: Request, res: Response, next: NextFunction): void {
  if (!env.internalKey) {
    res.status(503).json({
      status: 'error',
      message: 'GRUPO_FLOW_INTERNAL_KEY (ou JWT_SECRET) não configurado no microserviço.',
    });
    return;
  }
  const k =
    (req.headers['x-internal-key'] as string | undefined)?.trim() ||
    (req.headers['x-grupo-flow-internal-key'] as string | undefined)?.trim();
  if (!k || k !== env.internalKey) {
    res.status(401).json({ status: 'error', message: 'Chave interna inválida ou ausente.' });
    return;
  }
  next();
}
