import axios from 'axios';
import { config } from '../config';

let cachedToken: string | null = null;

export async function getAuthToken(): Promise<string> {
  if (!cachedToken) {
    const res = await axios.post<{ token: string }>(
      `${config.baseUrl}/auth/login`,
      { username: config.authUsername, password: config.authPassword },
      { headers: { 'Content-Type': 'application/json' } }
    );
    cachedToken = res.data.token;
  }
  return cachedToken;
}
