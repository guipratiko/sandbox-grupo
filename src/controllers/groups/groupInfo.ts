import * as Evo from '../../services/evolutionGroupService';
import { asyncGroupHandler, requireInstanceToken, groupJidFromParams } from '../../utils/groupRequest';
import { jsonError, jsonSuccess } from '../../utils/httpResponses';

function requireTokenAndJid(req: Parameters<typeof requireInstanceToken>[0], res: Parameters<typeof requireInstanceToken>[1]) {
  const instanceToken = requireInstanceToken(req, res);
  if (!instanceToken) return null;
  const groupJid = groupJidFromParams(req);
  if (!groupJid) {
    jsonError(res, 400, 'groupJid (path) é obrigatório.');
    return null;
  }
  return { instanceToken, groupJid };
}

export const getGroupInfo = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  jsonSuccess(res, await Evo.findGroupInfos(ctx.instanceToken, ctx.groupJid));
});

export const getGroupParticipants = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  jsonSuccess(res, await Evo.fetchParticipants(ctx.instanceToken, ctx.groupJid));
});

export const getGroupInvite = asyncGroupHandler(async (req, res) => {
  const ctx = requireTokenAndJid(req, res);
  if (!ctx) return;
  jsonSuccess(res, await Evo.inviteCode(ctx.instanceToken, ctx.groupJid));
});
