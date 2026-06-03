export function normalizeServiceBaseUrl(raw: string | undefined, fallback = ''): string {
  return (raw || fallback).trim().replace(/\/$/, '');
}

/** Host sem esquema vira https:// */
export function normalizeEvolutionBaseUrl(raw: string | undefined): string {
  const trimmed = (raw || '').trim().replace(/\/$/, '');
  if (!trimmed) return '';
  const withScheme = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const u = new URL(withScheme);
    if (!u.hostname) return '';
    const path = u.pathname === '/' ? '' : u.pathname.replace(/\/$/, '');
    return `${u.origin}${path}`;
  } catch {
    return '';
  }
}

export function parseCommaSeparatedOrigins(raw: string | undefined): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
