import axios, { type AxiosInstance } from 'axios';
import https from 'https';
import { EVOLUTION_CONFIG } from '../../config/constants';

export function createEvolutionGoClient(instanceToken: string): AxiosInstance {
  const baseURL = EVOLUTION_CONFIG.BASE_URL.replace(/\/$/, '');
  if (!baseURL) {
    throw new Error('EVOLUTION_API_BASE_URL / EVOLUTION_HOST não configurado.');
  }
  const httpsAgent = EVOLUTION_CONFIG.INSECURE_TLS
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;
  return axios.create({
    baseURL,
    timeout: EVOLUTION_CONFIG.HTTP_TIMEOUT_MS,
    headers: {
      apikey: instanceToken.trim(),
      'Content-Type': 'application/json',
    },
    httpsAgent,
    validateStatus: () => true,
  });
}

export function evolutionGoLocationLabels(
  latitude: number,
  longitude: number,
  name?: string,
  address?: string
): { name: string; address: string } {
  const nameTrim = String(name ?? '').trim();
  const addressTrim = String(address ?? '').trim();
  return {
    name: nameTrim || 'Localização',
    address: addressTrim || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`,
  };
}

export function goUnsupported(feature: string): never {
  const err = new Error(
    `${feature} ainda não está disponível na Evolution GO (documentação em evolução).`
  ) as Error & { status?: number };
  err.status = 501;
  throw err;
}
