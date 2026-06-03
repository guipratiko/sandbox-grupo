import * as Evo from '../../services/evolutionGroupService';
import { normalizeCreateGroupParticipants } from '../../utils/participantNormalization';
import { parseGroupsListFromEvolutionRaw } from '../../utils/groupListParser';
import {
  asyncGroupHandler,
  requireInstanceToken,
  instanceTokenFrom,
} from '../../utils/groupRequest';
import { jsonError, jsonSuccess } from '../../utils/httpResponses';

export const listGroups = asyncGroupHandler(async (req, res) => {
  const instanceToken = requireInstanceToken(req, res);
  if (!instanceToken) return;

  const getParticipants = String(req.query.getParticipants || 'false').toLowerCase() === 'true';
  const raw = await Evo.fetchAllGroups(instanceToken, getParticipants);
  const groups = parseGroupsListFromEvolutionRaw(raw);
  res.json({ status: 'success', data: { groups, raw } });
});

export const createGroup = asyncGroupHandler(async (req, res) => {
  const instanceToken = instanceTokenFrom(req);
  if (!instanceToken) {
    jsonError(res, 400, 'instanceToken é obrigatório (query ou body).');
    return;
  }

  const { subject, description, participants } = req.body as {
    subject?: string;
    description?: string;
    participants?: string[];
  };
  if (!subject?.trim() || !Array.isArray(participants)) {
    jsonError(res, 400, 'subject e participants (array) são obrigatórios.');
    return;
  }

  const normalized = normalizeCreateGroupParticipants(participants);
  if (!normalized.length) {
    jsonError(
      res,
      400,
      'É necessário pelo menos um número válido em participants (formato internacional, ex.: 5511999999999).'
    );
    return;
  }

  const payload: { subject: string; participants: string[]; description?: string } = {
    subject: subject.trim(),
    participants: normalized,
  };
  const desc = typeof description === 'string' ? description.trim() : '';
  if (desc) payload.description = desc;

  const data = await Evo.createGroup(instanceToken, payload);
  jsonSuccess(res, data, 201);
});
