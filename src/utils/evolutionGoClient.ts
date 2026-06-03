import axios, { type AxiosInstance } from 'axios';
import https from 'https';
import { env } from '../config/env';

export function createEvolutionGoClient(instanceToken: string): AxiosInstance {
  const baseURL = env.evolutionBaseUrl.replace(/\/$/, '');
  if (!baseURL) {
    throw new Error('EVOLUTION_API_BASE_URL não configurada.');
  }
  const httpsAgent = env.evolutionInsecureTls
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;
  return axios.create({
    baseURL,
    timeout: 120_000,
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
