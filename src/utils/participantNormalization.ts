/** 10–11 dígitos sem DDI → 55 (Brasil), alinhado ao disparo / frontend. */
export function ensureParticipantDdiDigits(digits: string): string | null {
  const d = digits.replace(/\D/g, '');
  if (!d) return null;
  if (d.length >= 12 && d.length <= 15) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return null;
}

/** Evolution GO: participantes como DDI+número (ex.: 5511999999999), sem @. */
export function normalizeCreateGroupParticipants(input: unknown[]): string[] {
  const out: string[] = [];
  for (const raw of input) {
    const s = String(raw ?? '').trim();
    if (!s) continue;
    if (s.includes('@g.us')) continue;
    if (s.includes('@s.whatsapp.net') || s.includes('@c.us')) {
      const digits = s.split('@')[0].replace(/\D/g, '');
      const n = ensureParticipantDdiDigits(digits);
      if (n) out.push(n);
      continue;
    }
    const digits = s.replace(/\D/g, '');
    const n = ensureParticipantDdiDigits(digits);
    if (n) out.push(n);
  }
  return [...new Set(out)];
}
