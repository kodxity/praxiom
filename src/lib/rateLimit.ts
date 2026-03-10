/**
 * In-memory rate limiter with fixed sliding window.
 * Keyed by an arbitrary string (e.g. "register:ip:1.2.3.4").
 * For multi-instance deployments replace the store with Redis.
 */

type Entry = { count: number; windowStart: number };

const store = new Map<string, Entry>();

// Prune stale entries periodically to prevent unbounded memory growth.
// Runs every 5 minutes and removes entries older than their window.
if (typeof setInterval !== 'undefined') {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of store) {
            // Keep a generous 10-minute buffer beyond the window before pruning.
            if (now - entry.windowStart > 10 * 60_000) {
                store.delete(key);
            }
        }
    }, 5 * 60_000);
}

export interface RateLimitConfig {
    windowMs: number; // window size in milliseconds
    max: number;      // max requests allowed per window
}

/**
 * Returns true if the request is allowed, false if it should be blocked.
 */
export function checkRateLimit(key: string, config: RateLimitConfig): boolean {
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now - entry.windowStart > config.windowMs) {
        store.set(key, { count: 1, windowStart: now });
        return true;
    }

    if (entry.count >= config.max) {
        return false;
    }

    entry.count++;
    return true;
}

/** Standard 429 response with Retry-After header */
export function rateLimitResponse(): Response {
    return new Response(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
            status: 429,
            headers: {
                'Content-Type': 'application/json',
                'Retry-After': '60',
            },
        },
    );
}

/** Extract the real client IP from standard proxy headers */
export function getIp(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) return forwarded.split(',')[0].trim();
    const realIp = req.headers.get('x-real-ip');
    if (realIp) return realIp.trim();
    return 'unknown';
}
