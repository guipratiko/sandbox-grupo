import type { Request, Response } from 'express';
import { resolveGroupSettingsCapability } from '../utils/groupSettingsCapability';
import { jsonSuccess } from '../utils/httpResponses';
import { asyncGroupHandler } from '../utils/groupRequest';

/** GET /api/grupo-flow/capabilities — sonda a Evolution GO e reporta recursos opcionais. */
export const getCapabilities = asyncGroupHandler(async (_req, res) => {
  const cap = await resolveGroupSettingsCapability();
  jsonSuccess(res, {
    groupSettings: cap.available,
    groupSettingsReason: cap.reason,
    evolutionHost: cap.evolutionHost,
    groupSettingsEnabled: process.env.EVOLUTION_GROUP_SETTINGS_ENABLED !== 'false',
  });
});
