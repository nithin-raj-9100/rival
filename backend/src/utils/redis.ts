import Redis from 'ioredis';

const REDIS_URL = process.env.REDIS_URL;

let redisClient: Redis | null = null;

function getClient(): Redis | null {
  if (redisClient) return redisClient;
  if (!REDIS_URL) return null;
  redisClient = new Redis(REDIS_URL, {
    maxRetriesPerRequest: 3,
    retryStrategy(times) {
      if (times > 3) return null;
      return Math.min(times * 200, 2000);
    },
  });
  redisClient.on('error', () => {});
  return redisClient;
}

export const redis = getClient();

export function cacheKey(prefix: string, ...parts: string[]) {
  return `task:${prefix}:${parts.join(':')}`;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const client = getClient();
  if (!client) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: unknown, ttlSeconds = 60) {
  const client = getClient();
  if (!client) return;
  try {
    await client.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  } catch {}
}

export async function delCache(key: string) {
  const client = getClient();
  if (!client) return;
  try {
    await client.del(key);
  } catch {}
}

export async function delByPattern(pattern: string) {
  const client = getClient();
  if (!client) return;
  try {
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {}
}
