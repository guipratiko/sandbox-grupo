import * as Evo from '../../services/evolutionGroupService';
import { normalizeCreateGroupParticipants } from '../../utils/participantNormalization';
import {
  asyncGroupHandler,
  requireInstanceToken,
  groupJidFromParams,
  instanceTokenFrom,
} from '../../utils/groupRequest';
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

export const sendGroupInvite = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { description, numbers } = req.body as { description?: string; numbers?: string[] };
  if (!description || !Array.isArray(numbers)) {
    jsonError(res, 400, 'description e numbers são obrigatórios.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.sendInvite(ctx.instanceToken, {
      groupJid: ctx.groupJid,
      description,
      numbers,
    })
  );
});

export const updateGroupSubject = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const subject = String((req.body as { subject?: string })?.subject || '');
  if (!subject) {
    jsonError(res, 400, 'subject é obrigatório.');
    return;
  }
  jsonSuccess(res, await Evo.updateGroupSubject(ctx.instanceToken, ctx.groupJid, subject));
});

export const updateGroupDescription = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const description = String((req.body as { description?: string })?.description ?? '');
  jsonSuccess(res, await Evo.updateGroupDescription(ctx.instanceToken, ctx.groupJid, description));
});

export const updateGroupPicture = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const image = String((req.body as { image?: string })?.image || '');
  if (!image) {
    jsonError(res, 400, 'image é obrigatório.');
    return;
  }
  jsonSuccess(res, await Evo.updateGroupPicture(ctx.instanceToken, ctx.groupJid, image));
});

export const updateGroupParticipants = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const { action, participants } = req.body as { action?: string; participants?: string[] };
  if (!action || !Array.isArray(participants)) {
    jsonError(res, 400, 'action e participants são obrigatórios.');
    return;
  }
  if (!['add', 'remove', 'promote', 'demote'].includes(action)) {
    jsonError(res, 400, 'action inválida (add|remove|promote|demote).');
    return;
  }
  const list =
    action === 'add'
      ? normalizeCreateGroupParticipants(participants)
      : participants.map((p) => String(p).trim()).filter(Boolean);
  if (!list.length) {
    jsonError(res, 400, 'participants não pode ser vazio.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.updateParticipant(ctx.instanceToken, ctx.groupJid, {
      action: action as 'add' | 'remove' | 'promote' | 'demote',
      participants: list,
    })
  );
});

export const updateGroupSettings = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const action = (req.body as { action?: string })?.action;
  if (!action) {
    jsonError(res, 400, 'action é obrigatório.');
    return;
  }
  if (!['announcement', 'not_announcement', 'locked', 'unlocked'].includes(action)) {
    jsonError(res, 400, 'action inválida.');
    return;
  }
  jsonSuccess(
    res,
    await Evo.updateSetting(ctx.instanceToken, ctx.groupJid, {
      action: action as 'announcement' | 'not_announcement' | 'locked' | 'unlocked',
    })
  );
});

export const toggleGroupEphemeral = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  const exp = Number((req.body as { expiration?: number })?.expiration);
  if (Number.isNaN(exp)) {
    jsonError(res, 400, 'expiration (número) é obrigatório.');
    return;
  }
  jsonSuccess(res, await Evo.toggleEphemeral(ctx.instanceToken, ctx.groupJid, exp));
});

export const leaveGroup = asyncGroupHandler(async (req, res) => {
  const instanceToken = instanceTokenFrom(req);
  const groupJid = groupJidFromParams(req);
  if (!instanceToken || !groupJid) {
    jsonError(res, 400, 'instanceToken e groupJid são obrigatórios.');
    return;
  }
  jsonSuccess(res, await Evo.leaveGroup(instanceToken, groupJid));
});
