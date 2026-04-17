import { Router, type Request, type Response } from 'express';
import * as Evo from '../services/evolutionGroupService';

const router = Router();

function instanceNameFrom(req: Request): string {
  const q = String(req.query.instanceName || '').trim();
  const b = req.body && typeof req.body === 'object' && typeof (req.body as { instanceName?: string }).instanceName === 'string'
    ? String((req.body as { instanceName: string }).instanceName).trim()
    : '';
  return q || b;
}

function sendEvolutionError(res: Response, err: unknown): void {
  const status = typeof (err as { status?: number }).status === 'number' ? (err as { status: number }).status : 500;
  const message = err instanceof Error ? err.message : 'Erro ao falar com a Evolution API';
  res.status(status >= 400 && status < 600 ? status : 500).json({ status: 'error', message });
}

/** 10–11 dígitos sem DDI → 55 (Brasil), alinhado ao disparo em massa / frontend. */
function ensureParticipantDdiDigits(digits: string): string | null {
  const d = digits.replace(/\D/g, '');
  if (!d) return null;
  if (d.length >= 12 && d.length <= 15) return d;
  if (d.length === 10 || d.length === 11) return `55${d}`;
  return null;
}

/** Evolution v2: participantes como array de strings só com DDI+número (ex.: 5511999999999), sem @. */
function normalizeCreateGroupParticipants(input: unknown[]): string[] {
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

/** GET /groups?instanceName=&getParticipants= */
router.get('/', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    if (!instanceName) {
      res.status(400).json({ status: 'error', message: 'instanceName é obrigatório (query).' });
      return;
    }
    const getParticipants = String(req.query.getParticipants || 'false').toLowerCase() === 'true';
    const raw = await Evo.fetchAllGroups(instanceName, getParticipants);
    const groups = Array.isArray(raw)
      ? raw
      : raw && typeof raw === 'object' && Array.isArray((raw as { groups?: unknown }).groups)
        ? (raw as { groups: unknown[] }).groups
        : raw && typeof raw === 'object' && Array.isArray((raw as { chats?: unknown }).chats)
          ? (raw as { chats: unknown[] }).chats
          : [];
    res.json({ status: 'success', data: { groups, raw } });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups — cria grupo; body: instanceName, subject, description?, participants[] */
router.post('/', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    if (!instanceName) {
      res.status(400).json({ status: 'error', message: 'instanceName é obrigatório (query ou body).' });
      return;
    }
    const { subject, description, participants } = req.body as {
      subject?: string;
      description?: string;
      participants?: string[];
    };
    if (!subject?.trim() || !Array.isArray(participants)) {
      res.status(400).json({ status: 'error', message: 'subject e participants (array) são obrigatórios.' });
      return;
    }
    const normalized = normalizeCreateGroupParticipants(participants);
    if (!normalized.length) {
      res.status(400).json({
        status: 'error',
        message:
          'É necessário pelo menos um número válido em participants (formato internacional, ex.: 5511999999999). Linhas como "Nome, 5511999999999" ou só o número.',
      });
      return;
    }
    const payload: { subject: string; participants: string[]; description?: string } = {
      subject: subject.trim(),
      participants: normalized,
    };
    const desc = typeof description === 'string' ? description.trim() : '';
    if (desc) payload.description = desc;
    const data = await Evo.createGroup(instanceName, payload);
    res.status(201).json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** GET /groups/:groupJid/info?instanceName= */
router.get('/:groupJid/info', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    if (!instanceName || !groupJid) {
      res.status(400).json({ status: 'error', message: 'instanceName (query) e groupJid (path) são obrigatórios.' });
      return;
    }
    const data = await Evo.findGroupInfos(instanceName, groupJid);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** GET /groups/:groupJid/participants?instanceName= */
router.get('/:groupJid/participants', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    if (!instanceName || !groupJid) {
      res.status(400).json({ status: 'error', message: 'instanceName e groupJid são obrigatórios.' });
      return;
    }
    const data = await Evo.fetchParticipants(instanceName, groupJid);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/send-text?instanceName= — body: text, mentionsEveryOne? */
router.post('/:groupJid/send-text', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { text, mentionsEveryOne } = req.body as { text?: string; mentionsEveryOne?: boolean };
    if (!instanceName || !groupJid || !text?.trim()) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e text são obrigatórios.' });
      return;
    }
    const data = await Evo.sendGroupText(instanceName, groupJid, {
      text: text.trim(),
      mentionsEveryOne: mentionsEveryOne === true,
    });
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/send-media — body: mediatype image|video|document, media (URL), caption?, fileName? */
router.post('/:groupJid/send-media', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { mediatype, media, caption, fileName } = req.body as {
      mediatype?: string;
      media?: string;
      caption?: string;
      fileName?: string;
    };
    if (!instanceName || !groupJid || !media?.trim()) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e media são obrigatórios.' });
      return;
    }
    const mt = String(mediatype || '').toLowerCase();
    if (mt !== 'image' && mt !== 'video' && mt !== 'document') {
      res.status(400).json({ status: 'error', message: 'mediatype deve ser image, video ou document.' });
      return;
    }
    const data = await Evo.sendGroupMedia(instanceName, groupJid, {
      mediatype: mt,
      media: media.trim(),
      caption,
      fileName,
    });
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/send-audio — body: audio (URL ou base64 aceito pela Evolution) */
router.post('/:groupJid/send-audio', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { audio } = req.body as { audio?: string };
    if (!instanceName || !groupJid || !audio?.trim()) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e audio são obrigatórios.' });
      return;
    }
    const data = await Evo.sendGroupWhatsAppAudio(instanceName, groupJid, audio.trim());
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/send-location — body: latitude, longitude, name?, address? */
router.post('/:groupJid/send-location', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { latitude, longitude, name, address } = req.body as {
      latitude?: number;
      longitude?: number;
      name?: string;
      address?: string;
    };
    if (!instanceName || !groupJid || typeof latitude !== 'number' || typeof longitude !== 'number') {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid, latitude e longitude são obrigatórios.' });
      return;
    }
    const data = await Evo.sendGroupLocation(instanceName, groupJid, {
      latitude,
      longitude,
      name,
      address,
    });
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/send-poll — body: name (pergunta), values[] (opções), selectableCount? */
router.post('/:groupJid/send-poll', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { name, values, selectableCount } = req.body as {
      name?: string;
      values?: string[];
      selectableCount?: number;
    };
    if (!instanceName || !groupJid || !name?.trim() || !Array.isArray(values)) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid, name e values são obrigatórios.' });
      return;
    }
    const opts = values.map((v) => String(v ?? '').trim()).filter(Boolean);
    if (opts.length < 2) {
      res.status(400).json({ status: 'error', message: 'A enquete precisa de pelo menos duas opções.' });
      return;
    }
    const data = await Evo.sendGroupPoll(instanceName, groupJid, {
      name: name.trim(),
      values: opts,
      selectableCount,
    });
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/send-contact — body: contact[] (fullName, wuid, phoneNumber, organization?, email?, url?) */
router.post('/:groupJid/send-contact', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { contact } = req.body as { contact?: Evo.GroupSendContactEntry[] };
    if (!instanceName || !groupJid || !Array.isArray(contact) || !contact.length) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e contact (array) são obrigatórios.' });
      return;
    }
    const data = await Evo.sendGroupContact(instanceName, groupJid, contact);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** GET /groups/:groupJid/invite?instanceName= */
router.get('/:groupJid/invite', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    if (!instanceName || !groupJid) {
      res.status(400).json({ status: 'error', message: 'instanceName e groupJid são obrigatórios.' });
      return;
    }
    const data = await Evo.inviteCode(instanceName, groupJid);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/send-invite — body: instanceName?, description, numbers[] */
router.post('/:groupJid/send-invite', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { description, numbers } = req.body as { description?: string; numbers?: string[] };
    if (!instanceName || !groupJid || !description || !Array.isArray(numbers)) {
      res.status(400).json({
        status: 'error',
        message: 'instanceName, groupJid, description e numbers são obrigatórios.',
      });
      return;
    }
    const data = await Evo.sendInvite(instanceName, { groupJid, description, numbers });
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/subject — body: instanceName?, subject */
router.post('/:groupJid/subject', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const subject = String((req.body as { subject?: string })?.subject || '');
    if (!instanceName || !groupJid || !subject) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e subject são obrigatórios.' });
      return;
    }
    const data = await Evo.updateGroupSubject(instanceName, groupJid, subject);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/description — body: instanceName?, description */
router.post('/:groupJid/description', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const description = String((req.body as { description?: string })?.description ?? '');
    if (!instanceName || !groupJid) {
      res.status(400).json({ status: 'error', message: 'instanceName e groupJid são obrigatórios.' });
      return;
    }
    const data = await Evo.updateGroupDescription(instanceName, groupJid, description);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/picture — body: instanceName?, image (URL ou base64 conforme Evolution) */
router.post('/:groupJid/picture', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const image = String((req.body as { image?: string })?.image || '');
    if (!instanceName || !groupJid || !image) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e image são obrigatórios.' });
      return;
    }
    const data = await Evo.updateGroupPicture(instanceName, groupJid, image);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/participant-updates — body: instanceName?, action, participants[] */
router.post('/:groupJid/participant-updates', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const { action, participants } = req.body as {
      action?: string;
      participants?: string[];
    };
    if (!instanceName || !groupJid || !action || !Array.isArray(participants)) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid, action e participants são obrigatórios.' });
      return;
    }
    if (!['add', 'remove', 'promote', 'demote'].includes(action)) {
      res.status(400).json({ status: 'error', message: 'action inválida (add|remove|promote|demote).' });
      return;
    }
    const list =
      action === 'add' ? normalizeCreateGroupParticipants(participants) : participants.map((p) => String(p).trim()).filter(Boolean);
    if (!list.length) {
      res.status(400).json({ status: 'error', message: 'participants não pode ser vazio.' });
      return;
    }
    const data = await Evo.updateParticipant(instanceName, groupJid, {
      action: action as 'add' | 'remove' | 'promote' | 'demote',
      participants: list,
    });
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/settings — body: instanceName?, action */
router.post('/:groupJid/settings', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const action = (req.body as { action?: string })?.action;
    if (!instanceName || !groupJid || !action) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e action são obrigatórios.' });
      return;
    }
    if (!['announcement', 'not_announcement', 'locked', 'unlocked'].includes(action)) {
      res.status(400).json({ status: 'error', message: 'action inválida.' });
      return;
    }
    const data = await Evo.updateSetting(instanceName, groupJid, {
      action: action as 'announcement' | 'not_announcement' | 'locked' | 'unlocked',
    });
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** POST /groups/:groupJid/ephemeral — body: instanceName?, expiration (number) */
router.post('/:groupJid/ephemeral', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    const exp = Number((req.body as { expiration?: number })?.expiration);
    if (!instanceName || !groupJid || Number.isNaN(exp)) {
      res.status(400).json({ status: 'error', message: 'instanceName, groupJid e expiration (número) são obrigatórios.' });
      return;
    }
    const data = await Evo.toggleEphemeral(instanceName, groupJid, exp);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

/** DELETE /groups/:groupJid/membership?instanceName= — sai do grupo (Evolution leaveGroup) */
router.delete('/:groupJid/membership', async (req, res) => {
  try {
    const instanceName = instanceNameFrom(req);
    const groupJid = decodeURIComponent(req.params.groupJid);
    if (!instanceName || !groupJid) {
      res.status(400).json({ status: 'error', message: 'instanceName e groupJid são obrigatórios.' });
      return;
    }
    const data = await Evo.leaveGroup(instanceName, groupJid);
    res.json({ status: 'success', data });
  } catch (e) {
    sendEvolutionError(res, e);
  }
});

export default router;
