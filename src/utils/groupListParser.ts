/** Normaliza payload de GET /group/list da Evolution GO. */
export function parseGroupsListFromEvolutionRaw(raw: unknown): unknown[] {
  if (Array.isArray(raw)) return raw;
  if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data;
    if (Array.isArray(o.groups)) return o.groups;
    if (Array.isArray(o.chats)) return o.chats;
  }
  return [];
}
