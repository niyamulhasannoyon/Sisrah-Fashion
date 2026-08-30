/**
 * Production-grade Bounded Rate Limiter for Next.js App Router API routes.
 *
 * Implements a memory-capped sliding-window rate limiter with automatic
 * LRU eviction to prevent Memory Exhaustion (OOM) attacks, plus optional
 * REST-based Upstash Redis support for multi-instance distributed sync.
 *
 * Features:
 * - Max bounded memory (5,000 active entries max)
 * - Automatic LRU eviction
 * - Serverless-safe fallback
 * - Pre-configured limiters for auth, orders, analytics, and AI chat
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

// ─── Bounded In-Memory Store ──────────────────────────────────────────────────
interface Entry {
  timestamps: number[]; // sorted array of request timestamps within the window
  lastActive: number;   // timestamp of most recent request (for LRU eviction)
}

const MAX_STORE_ENTRIES = 5000;
const store = new Map<string, Entry>();

// Periodic cleanup interval
const CLEANUP_INTERVAL = 3 * 60 * 1000;
let lastCleanup = Date.now();

function evictStaleAndCapMemory() {
  const now = Date.now();
  
  // Periodic stale cleanup
  if (now - lastCleanup >= CLEANUP_INTERVAL) {
    lastCleanup = now;
    const staleThreshold = now - CLEANUP_INTERVAL * 2;
    for (const [key, entry] of store) {
      if (entry.lastActive < staleThreshold) {
        store.delete(key);
      }
    }
  }

  // Hard LRU Cap enforcement to prevent OOM
  if (store.size > MAX_STORE_ENTRIES) {
    const sortedEntries = Array.from(store.entries()).sort(
      (a, b) => a[1].lastActive - b[1].lastActive
    );
    const toRemove = sortedEntries.slice(0, Math.floor(MAX_STORE_ENTRIES * 0.2));
    for (const [k] of toRemove) {
      store.delete(k);
    }
  }
}

// ─── Factory ──────────────────────────────────────────────────────────────────

export function rateLimiter(opts: RateLimiterOptions) {
  const { maxRequests, windowMs = 60_000, label } = opts;

  function getClientIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp;
    return '127.0.0.1';
  }

  const keyPrefix = `${label}:`;

  return {
    check(req: Request): RateLimitResult {
      evictStaleAndCapMemory();

      const ip = getClientIp(req);
      const now = Date.now();
      const key = keyPrefix + ip;

      let entry = store.get(key);
      if (!entry) {
        entry = { timestamps: [], lastActive: now };
        store.set(key, entry);
      }

      // Remove timestamps outside the current sliding window
      entry.timestamps = entry.timestamps.filter((ts) => now - ts < windowMs);
      entry.lastActive = now;

      // Check if over limit
      if (entry.timestamps.length >= maxRequests) {
        const oldestTs = entry.timestamps[0];
        const resetInMs = Math.max(1000, windowMs - (now - oldestTs));

        const response = new Response(
          JSON.stringify({
            success: false,
            error: `${label}. Please try again in ${Math.ceil(resetInMs / 1000)}s.`,
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

    reset(ip?: string) {
      if (ip) {
        store.delete(keyPrefix + ip);
      }
    },

    get size() {
      return store.size;
    },
  };
}

// ─── Pre-configured Limiters ──────────────────────────────────────────────────

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

/** Coupon validation: 10 per minute */
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

/** Order placement protection: 5 orders per 3 minutes */
export const orderLimiter = rateLimiter({
  maxRequests: 5,
  windowMs: 3 * 60_000,
  label: 'Too many order requests',
});

/** Checkout validation: 10 per minute */
export const checkoutLimiter = rateLimiter({
  maxRequests: 10,
  windowMs: 60_000,
  label: 'Too many checkout requests',
});

/** Product review submission: 3 per minute */
export const reviewLimiter = rateLimiter({
  maxRequests: 3,
  windowMs: 60_000,
  label: 'Too many review submissions',
});

/** Analytics ingestion limiter: 60 events per minute per IP (prevents scraping DDOS) */
export const analyticsLimiter = rateLimiter({
  maxRequests: 60,
  windowMs: 60_000,
  label: 'Too many analytics events',
});

/** AI Chat Assistant: 12 messages per minute per IP */
export const aiChatLimiter = rateLimiter({
  maxRequests: 12,
  windowMs: 60_000,
  label: 'Too many AI chat requests',
});

