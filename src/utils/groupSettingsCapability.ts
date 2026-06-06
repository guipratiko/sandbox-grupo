import { EVOLUTION_CONFIG } from '../config/constants';
import { probeEvolutionGroupSettingsRoute } from './groupSettingsProbe';

export type GroupSettingsCapabilityReason =
  | 'disabled_by_config'
  | 'evolution_go_route_missing'
  | null;

export async function resolveGroupSettingsCapability(): Promise<{
  available: boolean;
  reason: GroupSettingsCapabilityReason;
  evolutionHost: string | null;
}> {
  const evolutionHost = EVOLUTION_CONFIG.BASE_URL || null;

  if (process.env.EVOLUTION_GROUP_SETTINGS_ENABLED === 'false') {
    return { available: false, reason: 'disabled_by_config', evolutionHost };
  }

  const available = await probeEvolutionGroupSettingsRoute();
  return {
    available,
    reason: available ? null : 'evolution_go_route_missing',
    evolutionHost,
  };
}
