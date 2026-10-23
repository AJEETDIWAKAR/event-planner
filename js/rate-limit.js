/**
 * Small in-memory fixed-window rate limiter (per key, e.g. client IP).
 * Protects the AI endpoint from abuse and runaway API cost.
 */

/**
 * @param {{ limit?: number, windowMs?: number, maxKeys?: number, now?: () => number }} [options]
 * @returns {{ check: (key: string) => { allowed: boolean, remaining: number, retryAfterSec: number } }}
 */
export function createRateLimiter({
  limit = 10,
  windowMs = 60_000,
  maxKeys = 5000,
  now = Date.now,
} = {}) {
  const hits = new Map();

  function prune(t) {
    if (hits.size < maxKeys) {
      return;
    }
    for (const [key, entry] of hits) {
      if (entry.resetAt <= t) {
        hits.delete(key);
      }
    }
    if (hits.size >= maxKeys) {
      hits.clear();
    }
  }

  return {
    check(key) {
      const t = now();
      prune(t);
      const entry = hits.get(key);
      if (!entry || entry.resetAt <= t) {
        hits.set(key, { count: 1, resetAt: t + windowMs });
        return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
      }
      entry.count += 1;
      if (entry.count > limit) {
        return {
          allowed: false,
          remaining: 0,
          retryAfterSec: Math.ceil((entry.resetAt - t) / 1000),
        };
      }
      return { allowed: true, remaining: limit - entry.count, retryAfterSec: 0 };
    },
  };
}
