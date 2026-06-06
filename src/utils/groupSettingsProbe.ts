import axios from 'axios';
import https from 'https';
import { EVOLUTION_CONFIG } from '../config/constants';
import { setGroupSettingsRouteAvailability } from '../services/evolutionGroupService';

const PROBE_TTL_MS = 60_000;

let cachedAvailable: boolean | null = null;
let cachedAt = 0;

/** POST /group/settings na Evolution GO — 404 = rota inexistente (issue #42). */
export async function probeEvolutionGroupSettingsRoute(): Promise<boolean> {
  if (process.env.EVOLUTION_GROUP_SETTINGS_ENABLED === 'false') {
    setGroupSettingsRouteAvailability(false);
    return false;
  }

  const now = Date.now();
  if (cachedAvailable !== null && now - cachedAt < PROBE_TTL_MS) {
    return cachedAvailable;
  }

  const base = EVOLUTION_CONFIG.BASE_URL.replace(/\/$/, '');
  if (!base) {
    cachedAvailable = false;
    cachedAt = now;
    setGroupSettingsRouteAvailability(false);
    return false;
  }

  const apikey = EVOLUTION_CONFIG.API_KEY;
  if (!apikey) {
    console.warn('[Grupo-Flow] EVOLUTION_API_KEY ausente — não foi possível sondar POST /group/settings.');
    cachedAvailable = false;
    cachedAt = now;
    setGroupSettingsRouteAvailability(false);
    return false;
  }

  try {
    const res = await axios.post(
      `${base}/group/settings`,
      { groupJid: '000000000000000000@g.us', action: 'announcement' },
      {
        headers: { apikey, 'Content-Type': 'application/json' },
        timeout: 20_000,
        validateStatus: () => true,
        httpsAgent: EVOLUTION_CONFIG.INSECURE_TLS
          ? new https.Agent({ rejectUnauthorized: false })
          : undefined,
      }
    );

    // 404 = handler não registrado na GO; 400/401/403/500 = rota existe.
    const available = res.status !== 404;
    cachedAvailable = available;
    cachedAt = now;
    setGroupSettingsRouteAvailability(available);
    if (!available) {
      console.warn(
        `[Grupo-Flow] Evolution GO (${base}) não expõe POST /group/settings (HTTP ${res.status}). Anúncio/bloqueio indisponíveis.`
      );
    }
    return available;
  } catch (err) {
    console.warn('[Grupo-Flow] Falha ao sondar POST /group/settings na Evolution GO:', err);
    cachedAvailable = false;
    cachedAt = now;
    setGroupSettingsRouteAvailability(false);
    return false;
  }
}

export function invalidateGroupSettingsProbeCache(): void {
  cachedAvailable = null;
  cachedAt = 0;
}
