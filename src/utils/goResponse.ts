import type { AxiosResponse } from 'axios';

export function evolutionHttpMessage(res: AxiosResponse): string {
  const d = res.data;
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    const err = o.error;
    if (err && typeof err === 'object' && typeof (err as { message?: string }).message === 'string') {
      return (err as { message: string }).message;
    }
    if (typeof o.error === 'string') return o.error;
    if (typeof o.message === 'string') return o.message;
  }
  if (typeof d === 'string') return d.slice(0, 500);
  return res.statusText || 'Erro na Evolution GO';
}

/** Falha se HTTP >= 400 ou body `{ success: false }`. */
export function assertGoResponse(res: AxiosResponse, context: string): void {
  if (res.status >= 400) {
    const err = new Error(`${context}: ${evolutionHttpMessage(res)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
  const d = res.data;
  if (d && typeof d === 'object' && (d as { success?: boolean }).success === false) {
    const err = new Error(`${context}: ${evolutionHttpMessage(res)}`) as Error & { status?: number };
    err.status = res.status >= 400 ? res.status : 502;
    throw err;
  }
}

export function unwrapGoData(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  if (Array.isArray(payload)) {
    for (const item of payload) {
      const nested = unwrapGoData(item);
      if (nested) return nested;
    }
    return null;
  }
  const o = payload as Record<string, unknown>;
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    return o.data as Record<string, unknown>;
  }
  return o;
}
