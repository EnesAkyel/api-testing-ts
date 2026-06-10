import * as dotenv from 'dotenv';

dotenv.config();

function getEnv(key: string, defaultValue: string): string {
  return process.env[key] ?? defaultValue;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

export const config = {
  baseUrl: getEnv('BASE_URL', 'https://jsonplaceholder.typicode.com'),
  timeoutMs: parseInt(getEnv('REQUEST_TIMEOUT_MS', '30000'), 10),
  responseTimeThresholdMs: parseInt(getEnv('RESPONSE_TIME_THRESHOLD_MS', '3000'), 10),
} as const;

export { requireEnv };
