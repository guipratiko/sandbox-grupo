import * as Evo from '../../services/evolutionGroupService';
import { asyncGroupHandler, requireInstanceToken, groupJidFromParams } from '../../utils/groupRequest';
import { jsonError, jsonSuccess } from '../../utils/httpResponses';

function requireTokenAndJid(req: Parameters<typeof requireInstanceToken>[0], res: Parameters<typeof requireInstanceToken>[1]) {
  const instanceToken = requireInstanceToken(req, res);
  if (!instanceToken) return null;
  const groupJid = groupJidFromParams(req);
  if (!groupJid) {
    jsonError(res, 400, 'groupJid é obrigatório.');
    return null;
  }
  return { instanceToken, groupJid };
}

export const sendGroupText = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { text, mentionsEveryOne } = req.body as { text?: string; mentionsEveryOne?: boolean };
  if (!text?.trim()) {
    jsonError(res, 400, 'text é obrigatório.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.sendGroupText(ctx.instanceToken, ctx.groupJid, {
      text: text.trim(),
      mentionsEveryOne: mentionsEveryOne === true,
    })
  );
});

export const sendGroupMedia = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { mediatype, media, caption, fileName, mentionsEveryOne, mimetype } = req.body as {
    mediatype?: string;
    media?: string;
    caption?: string;
    fileName?: string;
    mentionsEveryOne?: boolean;
    mimetype?: string;
  };
  if (!media?.trim()) {
    jsonError(res, 400, 'media é obrigatório.');
    return;
  }
  const mt = String(mediatype || '').toLowerCase();
  if (mt !== 'image' && mt !== 'video' && mt !== 'document') {
    jsonError(res, 400, 'mediatype deve ser image, video ou document.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.sendGroupMedia(ctx.instanceToken, ctx.groupJid, {
      mediatype: mt,
      media: media.trim(),
      caption,
      fileName,
      mentionsEveryOne: mentionsEveryOne === true,
      mimetype,
    })
  );
});

export const sendGroupAudio = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { audio, mentionsEveryOne } = req.body as { audio?: string; mentionsEveryOne?: boolean };
  if (!audio?.trim()) {
    jsonError(res, 400, 'audio é obrigatório.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.sendGroupWhatsAppAudio(ctx.instanceToken, ctx.groupJid, audio.trim(), {
      mentionsEveryOne: mentionsEveryOne === true,
    })
  );
});

export const sendGroupLocation = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { latitude, longitude, name, address } = req.body as {
    latitude?: number;
    longitude?: number;
    name?: string;
    address?: string;
  };
  if (typeof latitude !== 'number' || typeof longitude !== 'number') {
    jsonError(res, 400, 'latitude e longitude são obrigatórios.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.sendGroupLocation(ctx.instanceToken, ctx.groupJid, { latitude, longitude, name, address })
  );
});

export const sendGroupPoll = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { name, values, selectableCount } = req.body as {
    name?: string;
    values?: string[];
    selectableCount?: number;
  };
  if (!name?.trim() || !Array.isArray(values)) {
    jsonError(res, 400, 'name e values são obrigatórios.');
    return;
  }
  const opts = values.map((v) => String(v ?? '').trim()).filter(Boolean);
  if (opts.length < 2) {
    jsonError(res, 400, 'A enquete precisa de pelo menos duas opções.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.sendGroupPoll(ctx.instanceToken, ctx.groupJid, {
      name: name.trim(),
      values: opts,
      selectableCount,
    })
  );
});

export const sendGroupContact = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { contact } = req.body as { contact?: Evo.GroupSendContactEntry[] };
  if (!Array.isArray(contact) || !contact.length) {
    jsonError(res, 400, 'contact (array) é obrigatório.');
    return;
  }
  jsonSuccess(res, await Evo.sendGroupContact(ctx.instanceToken, ctx.groupJid, contact));
});
