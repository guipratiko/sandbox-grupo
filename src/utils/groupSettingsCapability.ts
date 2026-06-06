import { isGroupSettingsRouteKnownUnavailable } from '../services/evolutionGroupService';

export type GroupSettingsCapabilityReason =
  | 'disabled_by_config'
  | 'evolution_go_route_missing'
  | null;

/** Indica se o Grupo-Flow tentará POST /group/settings na Evolution GO. */
export function getGroupSettingsCapability(): {
  available: boolean;
  reason: GroupSettingsCapabilityReason;
} {
  if (process.env.EVOLUTION_GROUP_SETTINGS_ENABLED === 'false') {
    return { available: false, reason: 'disabled_by_config' };
  }
  if (isGroupSettingsRouteKnownUnavailable()) {
    return { available: false, reason: 'evolution_go_route_missing' };
  }
  return { available: true, reason: null };
}
