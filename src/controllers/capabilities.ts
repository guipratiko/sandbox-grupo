import type { Request, Response } from 'express';
import { getGroupSettingsCapability } from '../utils/groupSettingsCapability';
import { jsonSuccess } from '../utils/httpResponses';

/** GET /api/grupo-flow/capabilities — recursos opcionais da Evolution GO. */
export function getCapabilities(_req: Request, res: Response): void {
  const groupSettings = getGroupSettingsCapability();
  jsonSuccess(res, {
    groupSettings: groupSettings.available,
    groupSettingsReason: groupSettings.reason,
  });
}
