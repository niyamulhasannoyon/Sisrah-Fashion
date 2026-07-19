/**
 * In-memory rate limiter for Next.js App Router API routes.
 *
 * Tracks request counts by IP using a sliding-window approach.
 * Each rate limiter instance has its own namespace in the shared Map,
 * so login, register, and other limiters don't interfere with each other.
 *
 * Usage:
 *   const limiter = rateLimiter({ maxRequests: 5, windowMs: 60_000 });
 *   const result = await limiter.check(request);
 *   if (result.blocked) return result.response;
 *
 * For production multi-server / serverless deployments, swap the store
 * with Upstash Redis (see @upstash/ratelimit).
 */

export interface RateLimitResult {
  blocked: boolean;
  remaining: number;
  resetInMs: number;
  response?: Response;
}

interface RateLimiterOptions {
  /** Max number of requests allowed within the window. */
  maxRequests: number;
  /** Window duration in milliseconds. Default 60_000 (1 minute). */
  windowMs?: number;
  /** Human-readable label for error messages and store namespace. */
  label: string;
}

// ─── In-memory store ─────────────────────────────────────────────────────────
interface Entry {
  timestamps: number[];  // sorted array of request timestamps within the window
  lastActive: number;    // timestamp of most recent request (for cleanup)
}

const store = new Map<string, Entry>();

// Periodically purge stale entries every 5 minutes to prevent memory leaks.
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  // Remove entries that haven't been active in 2x the cleanup interval
  const staleThreshold = now - CLEANUP_INTERVAL * 2;
  for (const [key, entry] of store) {
    if (entry.lastActive < staleThreshold) {
      store.delete(key);
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function rateLimiter(opts: RateLimiterOptions) {
  const { maxRequests, windowMs = 60_000, label } = opts;

  /**
   * Extract client IP from the request headers.
   * Falls back to a synthetic key when headers are unavailable (e.g. dev).
   */
  function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp;
    // Fallback for local dev
    return '127.0.0.1';
  }

  // Namespace the store key so different limiters don't collide on the same IP
  const keyPrefix = `${label}:`;

  return {
    /**
     * Check whether the current request should be rate-limited.
     * Call this at the top of your route handler.
     *
     * @returns An object with `blocked: true` + a `response` (429) when over limit,
     *          or `blocked: false` + remaining count when within limit.
     */
    check(req: Request): RateLimitResult {
      cleanup();

      const ip = getClientIp(req);
      const now = Date.now();
      const key = keyPrefix + ip;

      // Retrieve or create entry for this IP
      let entry = store.get(key);
      if (!entry) {
        entry = { timestamps: [], lastActive: now };
        store.set(key, entry);
      }

      // Remove timestamps outside the current window
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);
      entry.lastActive = now;

      // Check if over limit
      if (entry.timestamps.length >= maxRequests) {
        const oldestTs = entry.timestamps[0];
        const resetInMs = windowMs - (now - oldestTs);

        const response = new Response(
          JSON.stringify({
            success: false,
            error: `${label}. Please try again later.`,
            retryAfterMs: resetInMs,
          }),
          {
            status: 429,
            headers: {
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil(resetInMs / 1000)),
              'X-RateLimit-Limit': String(maxRequests),
              'X-RateLimit-Remaining': '0',
              'X-RateLimit-Reset': String(now + resetInMs),
            },
          }
        );

        return {
          blocked: true,
          remaining: 0,
          resetInMs,
          response,
        };
      }

      // Record this request
      entry.timestamps.push(now);

      return {
        blocked: false,
        remaining: maxRequests - entry.timestamps.length,
        resetInMs: 0,
      };
    },

    /**
     * Reset the rate limiter for a specific IP.
     * Useful after a successful login to allow immediate retries.
     */
    reset(ip?: string) {
      if (ip) {
        store.delete(keyPrefix + ip);
      }
    },

    /** Number of unique tracked entries (for diagnostics). */
    get size() {
      return store.size;
    },
  };
}

// ─── Pre-configured limiters for common auth endpoints ────────────────────────

/** Login attempts: 5 per minute */
export const loginLimiter = rateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
  label: 'Too many login attempts',
});

/** Registration: 3 per minute */
export const registerLimiter = rateLimiter({
  maxRequests: 3,
  windowMs: 60_000,
  label: 'Too many registration attempts',
});

/** Coupon code brute-force: 10 per minute */
export const couponLimiter = rateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
  label: 'Too many coupon validation attempts',
});

/** Staff login: 5 per minute */
export const staffLoginLimiter = rateLimiter({
  maxRequests: 5,
  windowMs: 60_000,
  label: 'Too many staff login attempts',
});
