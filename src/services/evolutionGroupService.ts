import type { AxiosInstance, AxiosResponse } from 'axios';
import { createEvolutionClient } from './evolutionClient';

function getClient(): AxiosInstance {
  const c = createEvolutionClient();
  if (!c) {
    const err = new Error('Evolution API não configurada (EVOLUTION_API_BASE_URL / EVOLUTION_API_KEY).') as Error & {
      status?: number;
    };
    err.status = 503;
    throw err;
  }
  return c;
}

function evolutionMessage(res: AxiosResponse): string {
  const d = res.data;
  if (d && typeof d === 'object' && 'message' in d && typeof (d as { message: unknown }).message === 'string') {
    return (d as { message: string }).message;
  }
  if (typeof d === 'string') return d.slice(0, 500);
  return res.statusText || 'Erro na Evolution API';
}

function assertOk(res: AxiosResponse, context: string): void {
  if (res.status >= 400) {
    const err = new Error(`${context}: ${evolutionMessage(res)}`) as Error & { status?: number };
    err.status = res.status;
    throw err;
  }
}

/** Lista todos os grupos da instância (Evolution v2). */
export async function fetchAllGroups(instanceName: string, getParticipants: boolean): Promise<unknown> {
  const client = getClient();
  const path = `/group/fetchAllGroups/${encodeURIComponent(instanceName)}?getParticipants=${getParticipants ? 'true' : 'false'}`;
  const res = await client.get(path);
  assertOk(res, 'fetchAllGroups');
  return res.data;
}

export async function findGroupInfos(instanceName: string, groupJid: string): Promise<unknown> {
  const client = getClient();
  const res = await client.get(
    `/group/findGroupInfos/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`
  );
  assertOk(res, 'findGroupInfos');
  return res.data;
}

export async function fetchParticipants(instanceName: string, groupJid: string): Promise<unknown> {
  const client = getClient();
  const res = await client.get(
    `/group/participants/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`
  );
  assertOk(res, 'participants');
  return res.data;
}

export async function inviteCode(instanceName: string, groupJid: string): Promise<unknown> {
  const client = getClient();
  const res = await client.get(
    `/group/inviteCode/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`
  );
  assertOk(res, 'inviteCode');
  return res.data;
}

export async function createGroup(
  instanceName: string,
  body: { subject: string; description?: string; participants: string[] }
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(`/group/create/${encodeURIComponent(instanceName)}`, body);
  assertOk(res, 'createGroup');
  return res.data;
}

export async function updateGroupSubject(instanceName: string, groupJid: string, subject: string): Promise<unknown> {
  const client = getClient();
  const res = await client.post(
    `/group/updateGroupSubject/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`,
    { subject }
  );
  assertOk(res, 'updateGroupSubject');
  return res.data;
}

export async function updateGroupDescription(
  instanceName: string,
  groupJid: string,
  description: string
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(
    `/group/updateGroupDescription/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`,
    { description }
  );
  assertOk(res, 'updateGroupDescription');
  return res.data;
}

/**
 * A Evolution (Baileys) usa `isBase64()` do class-validator: `data:image/...;base64,...`
 * não é aceito como base64 e cai em erro interno (500). Aqui enviamos URL http(s) ou só o payload base64.
 */
function normalizeImageForEvolutionGroupPicture(image: string): string {
  const s = String(image ?? '').trim();
  if (!s) return s;
  const dataUrl = /^data:[^;]+;base64,(.+)$/is.exec(s);
  if (dataUrl?.[1]) {
    return dataUrl[1].replace(/\s/g, '');
  }
  if (/^https?:\/\//i.test(s)) {
    return s;
  }
  return s.replace(/\s/g, '');
}

export async function updateGroupPicture(instanceName: string, groupJid: string, image: string): Promise<unknown> {
  const client = getClient();
  const normalized = normalizeImageForEvolutionGroupPicture(image);
  const res = await client.post(
    `/group/updateGroupPicture/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`,
    { groupJid, image: normalized }
  );
  assertOk(res, 'updateGroupPicture');
  return res.data;
}

export async function sendInvite(
  instanceName: string,
  body: { groupJid: string; description: string; numbers: string[] }
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(`/group/sendInvite/${encodeURIComponent(instanceName)}`, body);
  assertOk(res, 'sendInvite');
  return res.data;
}

export async function updateParticipant(
  instanceName: string,
  groupJid: string,
  body: { action: 'add' | 'remove' | 'promote' | 'demote'; participants: string[] }
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(
    `/group/updateParticipant/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`,
    body
  );
  assertOk(res, 'updateParticipant');
  return res.data;
}

export async function updateSetting(
  instanceName: string,
  groupJid: string,
  body: { action: 'announcement' | 'not_announcement' | 'locked' | 'unlocked' }
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(
    `/group/updateSetting/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`,
    body
  );
  assertOk(res, 'updateSetting');
  return res.data;
}

export async function toggleEphemeral(instanceName: string, groupJid: string, expiration: number): Promise<unknown> {
  const client = getClient();
  const res = await client.post(
    `/group/toggleEphemeral/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`,
    { expiration }
  );
  assertOk(res, 'toggleEphemeral');
  return res.data;
}

export async function leaveGroup(instanceName: string, groupJid: string): Promise<unknown> {
  const client = getClient();
  const res = await client.delete(
    `/group/leaveGroup/${encodeURIComponent(instanceName)}?groupJid=${encodeURIComponent(groupJid)}`
  );
  assertOk(res, 'leaveGroup');
  return res.data;
}

/** Texto no grupo (ex.: mencionar todos). Evolution: POST /message/sendText/:instance */
export async function sendGroupText(
  instanceName: string,
  groupJid: string,
  body: { text: string; mentionsEveryOne?: boolean }
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(`/message/sendText/${encodeURIComponent(instanceName)}`, {
    number: groupJid,
    text: body.text,
    mentionsEveryOne: body.mentionsEveryOne === true,
  });
  assertOk(res, 'sendGroupText');
  return res.data;
}

/** Imagem / vídeo / documento no grupo — POST /message/sendMedia/:instance */
export async function sendGroupMedia(
  instanceName: string,
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
  const client = getClient();
  const payload: Record<string, unknown> = {
    number: groupJid,
    mediatype: body.mediatype,
    media: body.media,
    caption: body.caption?.trim() ? body.caption.trim() : '',
  };
  if (body.fileName?.trim()) payload.fileName = body.fileName.trim();
  else if (body.mediatype === 'document') payload.fileName = 'arquivo';
  if (body.mimetype?.trim()) payload.mimetype = body.mimetype.trim();
  if (body.mentionsEveryOne === true) payload.mentionsEveryOne = true;
  const res = await client.post(`/message/sendMedia/${encodeURIComponent(instanceName)}`, payload);
  assertOk(res, 'sendGroupMedia');
  return res.data;
}

/** Áudio (PTT) no grupo — POST /message/sendWhatsAppAudio/:instance */
export async function sendGroupWhatsAppAudio(
  instanceName: string,
  groupJid: string,
  audioUrl: string,
  opts?: { mentionsEveryOne?: boolean }
): Promise<unknown> {
  const client = getClient();
  const payload: Record<string, unknown> = {
    number: groupJid,
    audio: audioUrl.trim(),
  };
  if (opts?.mentionsEveryOne === true) payload.mentionsEveryOne = true;
  const res = await client.post(`/message/sendWhatsAppAudio/${encodeURIComponent(instanceName)}`, payload);
  assertOk(res, 'sendGroupWhatsAppAudio');
  return res.data;
}

/** Localização no grupo — POST /message/sendLocation/:instance */
export async function sendGroupLocation(
  instanceName: string,
  groupJid: string,
  body: { latitude: number; longitude: number; name?: string; address?: string }
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(`/message/sendLocation/${encodeURIComponent(instanceName)}`, {
    number: groupJid,
    name: body.name?.trim() || '',
    address: body.address?.trim() || '',
    latitude: body.latitude,
    longitude: body.longitude,
  });
  assertOk(res, 'sendGroupLocation');
  return res.data;
}

/** Enquete no grupo — POST /message/sendPoll/:instance */
export async function sendGroupPoll(
  instanceName: string,
  groupJid: string,
  body: { name: string; values: string[]; selectableCount?: number }
): Promise<unknown> {
  const client = getClient();
  const res = await client.post(`/message/sendPoll/${encodeURIComponent(instanceName)}`, {
    number: groupJid,
    name: body.name.trim(),
    values: body.values.map((v) => v.trim()).filter(Boolean),
    selectableCount: typeof body.selectableCount === 'number' && body.selectableCount > 0 ? body.selectableCount : 1,
  });
  assertOk(res, 'sendGroupPoll');
  return res.data;
}

export type GroupSendContactEntry = {
  fullName: string;
  wuid: string;
  phoneNumber: string;
  organization?: string;
  email?: string;
  url?: string;
};

/** Cartão de contato no grupo — POST /message/sendContact/:instance */
export async function sendGroupContact(instanceName: string, groupJid: string, contact: GroupSendContactEntry[]): Promise<unknown> {
  const client = getClient();
  const res = await client.post(`/message/sendContact/${encodeURIComponent(instanceName)}`, {
    number: groupJid,
    contact: contact.map((c) => ({
      fullName: c.fullName.trim(),
      wuid: String(c.wuid).replace(/\D/g, ''),
      phoneNumber: c.phoneNumber.trim(),
      organization: (c.organization ?? '').trim(),
      email: (c.email ?? '').trim(),
      url: (c.url ?? '').trim(),
    })),
  });
  assertOk(res, 'sendGroupContact');
  return res.data;
}
