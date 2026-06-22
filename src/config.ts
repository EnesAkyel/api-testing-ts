import * as dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

export const config = {
  baseUrl: process.env['LOCAL_HOST_URL'] ?? getEnv('BASE_URL', 'http://localhost:8080/api/v1'),
  timeoutMs: parseInt(getEnv('REQUEST_TIMEOUT_MS', '30000'), 10),
  responseTimeThresholdMs: parseInt(getEnv('RESPONSE_TIME_THRESHOLD_MS', '3000'), 10),
} as const;
