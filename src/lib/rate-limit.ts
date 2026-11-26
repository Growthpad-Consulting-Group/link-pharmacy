import "server-only";
import { collections } from "@/lib/db/collections";

export type RateLimitResult = { allowed: true } | { allowed: false; retryAfterSeconds: number };

/**
 * Counts one attempt against `key` in the current fixed window. The counts live in MongoDB,
 * so the limit holds across every server instance, not just one process.
 */
export async function consumeRateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const windowMs = windowSeconds * 1000;
  const windowStart = Math.floor(Date.now() / windowMs) * windowMs;
  const windowEnd = new Date(windowStart + windowMs);
  const id = `${key}:${windowStart}`;

  const { rateLimits } = await collections();
  await rateLimits.updateOne(
    { _id: id },
    { $inc: { count: 1 }, $setOnInsert: { expiresAt: windowEnd } },
    { upsert: true },
  );
  const doc = await rateLimits.findOne({ _id: id });
  const count = doc?.count ?? 1;

  if (count <= limit) return { allowed: true };
  return { allowed: false, retryAfterSeconds: Math.max(1, Math.ceil((windowEnd.getTime() - Date.now()) / 1000)) };
}

/** The client address, taken from the proxy header when present. Set your host's proxy to overwrite this header. */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  return forwarded?.split(",")[0]?.trim() || request.headers.get("x-real-ip") || "unknown";
}

/** Checks several limits in order and returns the first one that is exceeded. */
export async function checkLimits(
  checks: { key: string; limit: number; windowSeconds: number }[],
): Promise<RateLimitResult> {
  for (const check of checks) {
    const result = await consumeRateLimit(check.key, check.limit, check.windowSeconds);
    if (!result.allowed) return result;
  }
  return { allowed: true };
}

export function tooManyRequests(result: { retryAfterSeconds: number }): Response {
  return Response.json(
    { error: "Too many attempts. Please wait a few minutes and try again." },
    { status: 429, headers: { "Retry-After": String(result.retryAfterSeconds) } },
  );
}
