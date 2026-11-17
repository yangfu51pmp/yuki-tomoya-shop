import { readFile, writeFile } from 'fs/promises';
import {
  YUKI_TOMOYA_M3M7_CONFIG,
  TomoyaCommerceState,
  DEFAULT_TOMOYA_COMMERCE_STATE,
} from './types-and-catalog';

const STATE_KEY = `${YUKI_TOMOYA_M3M7_CONFIG.redisKeyPrefix}:state`;

export async function loadTomoyaCommerceState(): Promise<TomoyaCommerceState> {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const res = await fetch(`${url}/get/${encodeURIComponent(STATE_KEY)}`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: 'no-store',
      });
      if (res.ok) {
        const data = (await res.json()) as { result?: string | null };
        if (data.result) {
          return JSON.parse(data.result) as TomoyaCommerceState;
        }
      }
    } catch {
      // Fallback to local file
    }
  }

  try {
    const raw = await readFile(YUKI_TOMOYA_M3M7_CONFIG.localFallbackFile, 'utf8');
    return JSON.parse(raw) as TomoyaCommerceState;
  } catch {
    return DEFAULT_TOMOYA_COMMERCE_STATE;
  }
}

export async function saveTomoyaCommerceState(
  nextState: TomoyaCommerceState
): Promise<void> {
  const stamped: TomoyaCommerceState = {
    ...nextState,
    updatedAt: new Date().toISOString(),
  };

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      await fetch(`${url}/set/${encodeURIComponent(STATE_KEY)}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify(stamped),
      });
    } catch {
      // Continue writing local fallback
    }
  }

  try {
    await writeFile(
      YUKI_TOMOYA_M3M7_CONFIG.localFallbackFile,
      JSON.stringify(stamped, null, 2),
      'utf8'
    );
  } catch {
    // Ignore read-only fs in serverless if Redis succeeded
  }
}
