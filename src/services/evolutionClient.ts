import axios, { type AxiosInstance } from 'axios';
import https from 'https';
import { env } from '../config/env';

/**
 * Cliente HTTP mínimo para a Evolution API.
 * Expandir com métodos por recurso (grupos, instância, etc.) conforme o fluxo for implementado.
 */
export function createEvolutionClient(): AxiosInstance | null {
  if (!env.evolutionBaseUrl) {
    return null;
  }

  const httpsAgent = env.evolutionInsecureTls
    ? new https.Agent({ rejectUnauthorized: false })
    : undefined;

  return axios.create({
    baseURL: env.evolutionBaseUrl,
    timeout: 60_000,
    headers: {
      ...(env.evolutionApiKey ? { apikey: env.evolutionApiKey } : {}),
      'Content-Type': 'application/json',
    },
    httpsAgent,
    validateStatus: () => true,
  });
}
