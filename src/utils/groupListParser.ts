/** Lê string de objeto GO com chaves camelCase ou PascalCase. */
function pickStr(o: Record<string, unknown>, ...keys: string[]): string {
  for (const k of keys) {
    const v = o[k];
    if (v != null && String(v).trim()) return String(v).trim();
  }
  return '';
}

/** Normaliza um registro de grupo da Evolution GO para o formato esperado pelo Frontend. */
export function normalizeGoGroupRecord(raw: unknown): Record<string, unknown> {
  if (!raw || typeof raw !== 'object') {
    return { id: '-', jid: '-', groupJid: '-', subject: '-', name: '-' };
  }
  const o = raw as Record<string, unknown>;
  const jid = pickStr(o, 'JID', 'jid', 'id', 'groupJid');
  const name = pickStr(o, 'Name', 'name', 'subject', 'groupName');
  const participants = o.Participants ?? o.participants;
  let size: number | undefined;
  if (typeof o.size === 'number' && Number.isFinite(o.size)) {
    size = o.size;
  } else if (Array.isArray(participants)) {
    size = participants.length;
  }
  return {
    id: jid || '-',
    jid: jid || '-',
    groupJid: jid || '-',
    subject: name || '-',
    name: name || '-',
    ...(size !== undefined ? { size } : {}),
    ...(Array.isArray(participants) ? { participants } : {}),
  };
}

/** Normaliza payload de GET /group/list da Evolution GO. */
export function parseGroupsListFromEvolutionRaw(raw: unknown): unknown[] {
  let list: unknown[] = [];
  if (Array.isArray(raw)) {
    list = raw;
  } else if (raw && typeof raw === 'object') {
    const o = raw as Record<string, unknown>;
    if (Array.isArray(o.data)) list = o.data;
    else if (Array.isArray(o.groups)) list = o.groups;
    else if (Array.isArray(o.chats)) list = o.chats;
  }
  return list.map(normalizeGoGroupRecord);
}

/** Extrai participantes de POST /group/info. */
export function extractParticipantsFromGroupInfo(info: unknown): unknown[] {
  const row = unwrapGoDataForParticipants(info);
  if (!row) return [];
  const p = row.Participants ?? row.participants;
  return Array.isArray(p) ? p : [];
}

function unwrapGoDataForParticipants(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== 'object') return null;
  const o = payload as Record<string, unknown>;
  if (o.data && typeof o.data === 'object' && !Array.isArray(o.data)) {
    return o.data as Record<string, unknown>;
  }
  return o;
}

/** Normaliza info de grupo para consumo do Frontend (getGroupInfo). */
export function normalizeGoGroupInfo(raw: unknown): Record<string, unknown> {
  const row = unwrapGoDataForParticipants(raw);
  if (!row) return {};
  const jid = pickStr(row, 'JID', 'jid', 'id', 'groupJid');
  const subject = pickStr(row, 'Name', 'name', 'subject', 'groupName');
  const description = pickStr(row, 'Topic', 'topic', 'desc', 'description', 'about');
  const participants = row.Participants ?? row.participants;
  let size: number | undefined;
  if (typeof row.size === 'number') size = row.size;
  else if (Array.isArray(participants)) size = participants.length;
  return {
    ...row,
    id: jid,
    jid,
    groupJid: jid,
    subject,
    name: subject,
    description,
    desc: description,
    about: description,
    ...(size !== undefined ? { size } : {}),
    ...(Array.isArray(participants) ? { participants } : {}),
    isAnnounce: row.IsAnnounce ?? row.isAnnounce ?? row.announce,
    isLocked: row.IsLocked ?? row.isLocked ?? row.restrict,
  };
}

/** Garante JID de grupo (@g.us) para envio. */
export function ensureGroupJid(groupJid: string): string {
  const trimmed = String(groupJid ?? '').trim();
  if (!trimmed) return trimmed;
  if (trimmed.includes('@')) return trimmed;
  const digits = trimmed.replace(/\D/g, '');
  return digits ? `${digits}@g.us` : trimmed;
}
