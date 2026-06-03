import type { AxiosResponse } from 'axios';
import { createEvolutionGoClient, evolutionGoLocationLabels, goUnsupported } from '../integrations/whatsapp';

function client(instanceToken: string) {
  return createEvolutionGoClient(instanceToken);
}

function evolutionMessage(res: AxiosResponse): string {
  const d = res.data;
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    if (typeof o.error === 'string') return o.error;
    if (o.error && typeof o.error === 'object' && typeof (o.error as { message?: string }).message === 'string') {
      return (o.error as { message: string }).message;
    }
    if (typeof o.message === 'string') return o.message;
  }
  if (typeof d === 'string') return d.slice(0, 500);
  return res.statusText || 'Erro na Evolution GO';
}

function assertOk(res: AxiosResponse, context: string): void {
  if (res.status >= 400) {
    const err = new Error(`${context}: ${evolutionMessage(res)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
}

/** GET /group/list — lista grupos (participantes vêm no payload quando a GO os inclui). */
export async function fetchAllGroups(
  instanceToken: string,
  _getParticipants: boolean
): Promise<unknown> {
  const res = await client(instanceToken).get('/group/list');
  assertOk(res, 'fetchAllGroups');
  return res.data;
}

export async function findGroupInfos(instanceToken: string, groupJid: string): Promise<unknown> {
  const res = await client(instanceToken).post('/group/info', { groupJid });
  assertOk(res, 'findGroupInfos');
  return res.data;
}

export async function fetchParticipants(instanceToken: string, groupJid: string): Promise<unknown> {
  const info = await findGroupInfos(instanceToken, groupJid);
  const row = (info as { data?: Record<string, unknown> })?.data ?? info;
  if (row && typeof row === 'object' && Array.isArray((row as { Participants?: unknown }).Participants)) {
    return (row as { Participants: unknown }).Participants;
  }
  return [];
}

export async function inviteCode(instanceToken: string, groupJid: string): Promise<unknown> {
  const res = await client(instanceToken).post('/group/invitelink', { groupJid });
  assertOk(res, 'inviteCode');
  return res.data;
}

export async function createGroup(
  instanceToken: string,
  body: { subject: string; description?: string; participants: string[] }
): Promise<unknown> {
  const res = await client(instanceToken).post('/group/create', {
    groupName: body.subject,
    participants: body.participants,
  });
  assertOk(res, 'createGroup');
  return res.data;
}

export async function updateGroupSubject(
  instanceToken: string,
  groupJid: string,
  subject: string
): Promise<unknown> {
  const res = await client(instanceToken).post('/group/name', { groupJid, name: subject });
  assertOk(res, 'updateGroupSubject');
  return res.data;
}

export async function updateGroupDescription(
  _instanceToken: string,
  _groupJid: string,
  _description: string
): Promise<unknown> {
  return goUnsupported('Alteração de descrição do grupo');
}

function normalizeImageForGroupPicture(image: string): string {
  const s = String(image ?? '').trim();
  if (!s) return s;
  const dataUrl = /^data:[^;]+;base64,(.+)$/is.exec(s);
  if (dataUrl?.[1]) return dataUrl[1].replace(/\s/g, '');
  if (/^https?:\/\//i.test(s)) return s;
  return s.replace(/\s/g, '');
}

export async function updateGroupPicture(
  instanceToken: string,
  groupJid: string,
  image: string
): Promise<unknown> {
  const res = await client(instanceToken).post('/group/photo', {
    groupJid,
    image: normalizeImageForGroupPicture(image),
  });
  assertOk(res, 'updateGroupPicture');
  return res.data;
}

export async function sendInvite(
  instanceToken: string,
  body: { groupJid: string; description: string; numbers: string[] }
): Promise<unknown> {
  const res = await client(instanceToken).post('/group/participant', {
    groupJid: body.groupJid,
    action: 'add',
    participants: body.numbers.map((n) => n.replace(/\D/g, '')).filter(Boolean),
  });
  assertOk(res, 'sendInvite');
  return res.data;
}

export async function updateParticipant(
  instanceToken: string,
  groupJid: string,
  body: { action: 'add' | 'remove' | 'promote' | 'demote'; participants: string[] }
): Promise<unknown> {
  const res = await client(instanceToken).post('/group/participant', {
    groupJid,
    action: body.action,
    participants: body.participants.map((n) => n.replace(/\D/g, '')).filter(Boolean),
  });
  assertOk(res, 'updateParticipant');
  return res.data;
}

export async function updateSetting(
  _instanceToken: string,
  _groupJid: string,
  _body: { action: 'announcement' | 'not_announcement' | 'locked' | 'unlocked' }
): Promise<unknown> {
  return goUnsupported('Configurações de anúncio/bloqueio do grupo');
}

export async function toggleEphemeral(
  _instanceToken: string,
  _groupJid: string,
  _expiration: number
): Promise<unknown> {
  return goUnsupported('Mensagens temporárias no grupo');
}

export async function leaveGroup(_instanceToken: string, _groupJid: string): Promise<unknown> {
  return goUnsupported('Sair do grupo');
}

export async function sendGroupText(
  instanceToken: string,
  groupJid: string,
  body: { text: string; mentionsEveryOne?: boolean }
): Promise<unknown> {
  const res = await client(instanceToken).post('/send/text', {
    number: groupJid,
    text: body.text,
    ...(body.mentionsEveryOne === true ? { mentionAll: true } : {}),
  });
  assertOk(res, 'sendGroupText');
  return res.data;
}

export async function sendGroupMedia(
  instanceToken: string,
  groupJid: string,
  body: {
    mediatype: 'image' | 'video' | 'document';
    media: string;
    caption?: string;
    fileName?: string;
    mentionsEveryOne?: boolean;
    mimetype?: string;
  }
): Promise<unknown> {
  const payload: Record<string, unknown> = {
    number: groupJid,
    type: body.mediatype,
    url: body.media,
    ...(body.caption?.trim() ? { caption: body.caption.trim() } : {}),
    ...(body.mediatype === 'document'
      ? { filename: body.fileName?.trim() || 'arquivo' }
      : {}),
    ...(body.mentionsEveryOne === true ? { mentionAll: true } : {}),
  };
  const res = await client(instanceToken).post('/send/media', payload);
  assertOk(res, 'sendGroupMedia');
  return res.data;
}

export async function sendGroupWhatsAppAudio(
  instanceToken: string,
  groupJid: string,
  audioUrl: string,
  opts?: { mentionsEveryOne?: boolean }
): Promise<unknown> {
  const res = await client(instanceToken).post('/send/media', {
    number: groupJid,
    type: 'audio',
    url: audioUrl.trim(),
    ...(opts?.mentionsEveryOne === true ? { mentionAll: true } : {}),
  });
  assertOk(res, 'sendGroupWhatsAppAudio');
  return res.data;
}

export async function sendGroupLocation(
  instanceToken: string,
  groupJid: string,
  body: { latitude: number; longitude: number; name?: string; address?: string }
): Promise<unknown> {
  const labels = evolutionGoLocationLabels(body.latitude, body.longitude, body.name, body.address);
  const res = await client(instanceToken).post('/send/location', {
    number: groupJid,
    latitude: body.latitude,
    longitude: body.longitude,
    name: labels.name,
    address: labels.address,
  });
  assertOk(res, 'sendGroupLocation');
  return res.data;
}

export async function sendGroupPoll(
  instanceToken: string,
  groupJid: string,
  body: { name: string; values: string[]; selectableCount?: number }
): Promise<unknown> {
  const res = await client(instanceToken).post('/send/poll', {
    number: groupJid,
    question: body.name.trim(),
    options: body.values.map((v) => v.trim()).filter(Boolean),
    maxAnswer: typeof body.selectableCount === 'number' && body.selectableCount > 0 ? body.selectableCount : 1,
  });
  assertOk(res, 'sendGroupPoll');
  return res.data;
}

export type GroupSendContactEntry = {
  fullName: string;
  wuid: string;
  phone: string;
  organization?: string;
};

export async function sendGroupContact(
  instanceToken: string,
  groupJid: string,
  contact: GroupSendContactEntry[]
): Promise<unknown> {
  const card = contact[0];
  if (!card) throw new Error('contact vazio');
  const res = await client(instanceToken).post('/send/contact', {
    number: groupJid,
    vcard: {
      fullName: card.fullName.trim(),
      phone: card.wuid.replace(/\D/g, '') || card.phone.replace(/\D/g, ''),
      organization: (card.organization ?? '').trim(),
    },
  });
  assertOk(res, 'sendGroupContact');
  return res.data;
}
