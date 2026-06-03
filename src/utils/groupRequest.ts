import { Request, Response, NextFunction } from 'express';
import { jsonError, sendEvolutionError } from './httpResponses';

/** Token UUID da instância (apikey Evolution GO). */
export function instanceTokenFrom(req: Request): string {
  const header = String(req.headers['x-evolution-instance-token'] || '').trim();
  const q = String(req.query.instanceToken || '').trim();
  const b =
    req.body && typeof req.body === 'object' && typeof (req.body as { instanceToken?: string }).instanceToken === 'string'
      ? String((req.body as { instanceToken: string }).instanceToken).trim()
      : '';
  return header || q || b;
}

export function requireInstanceToken(req: Request, res: Response): string | null {
  const token = instanceTokenFrom(req);
  if (!token) {
    jsonError(
      res,
      400,
      'Token da instância ausente. Envie instanceToken (query/body) ou x-evolution-instance-token.'
    );
    return null;
  }
  return token;
}

export function groupJidFromParams(req: Request): string {
  return decodeURIComponent(req.params.groupJid || '');
}

export function asyncGroupHandler(fn: (req: Request, res: Response) => Promise<void>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    fn(req, res).catch((err) => {
      if (res.headersSent) return next(err);
      sendEvolutionError(res, err);
    });
  };
}
