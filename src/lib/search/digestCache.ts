const TTL_MS = 10 * 60 * 1000;

interface CacheEntry {
  text: string;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry>();

function normalize(query: string): string {
  return query.trim().toLowerCase();
}

export function getCachedDigest(query: string): string | null {
  const entry = cache.get(normalize(query));
  if (!entry || entry.expiresAt < Date.now()) return null;
  return entry.text;
}

export function setCachedDigest(query: string, text: string): void {
  cache.set(normalize(query), { text, expiresAt: Date.now() + TTL_MS });
}
