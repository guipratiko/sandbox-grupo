/**
 * Configurações centralizadas do Grupo-Flow.
 */

import './loadEnv';
import { normalizeEvolutionBaseUrl, parseCommaSeparatedOrigins } from './serviceUrl';

export const SERVER_CONFIG = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: Number(process.env.PORT) || 4334,
  CORS_ORIGINS: parseCommaSeparatedOrigins(process.env.CORS_ORIGINS),
} as const;

export const INTERNAL_API_CONFIG = {
  KEY: (process.env.GRUPO_FLOW_INTERNAL_KEY || process.env.JWT_SECRET || '').trim(),
} as const;

export const EVOLUTION_CONFIG = {
  BASE_URL: normalizeEvolutionBaseUrl(
    process.env.EVOLUTION_API_BASE_URL || process.env.EVOLUTION_HOST
  ),
  API_KEY: (process.env.EVOLUTION_API_KEY || process.env.EVOLUTION_APIKEY || '').trim(),
  INSECURE_TLS: process.env.EVOLUTION_INSECURE_TLS === 'true',
  HTTP_TIMEOUT_MS: 120_000,
} as const;

/** Objeto legado — prefira SERVER_CONFIG / EVOLUTION_CONFIG em código novo. */
export const env = {
  NODE_ENV: SERVER_CONFIG.NODE_ENV,
  PORT: SERVER_CONFIG.PORT,
  evolutionBaseUrl: EVOLUTION_CONFIG.BASE_URL,
  evolutionApiKey: EVOLUTION_CONFIG.API_KEY,
  internalKey: INTERNAL_API_CONFIG.KEY,
  corsOrigins: SERVER_CONFIG.CORS_ORIGINS,
  evolutionInsecureTls: EVOLUTION_CONFIG.INSECURE_TLS,
};
