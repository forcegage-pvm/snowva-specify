// packages/web/src/middleware/rateLimit.ts
import { NextRequest, NextResponse } from 'next/server';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 100;

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

const getClientKey = (request: NextRequest) => {
  const forwardedFor = request.headers.get('x-forwarded-for');

  if (forwardedFor) {
    return forwardedFor.split(',')[0]?.trim() ?? 'unknown';
  }

  const realIp = request.headers.get('x-real-ip');

  if (realIp) {
    return realIp;
  }

  return 'unknown';
};

export function rateLimiter(request: NextRequest): NextResponse {
  const key = getClientKey(request);
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return NextResponse.next();
  }

  if (existing.count >= MAX_REQUESTS) {
    const retryAfterSeconds = Math.max(0, Math.ceil((existing.resetAt - now) / 1000));
    return NextResponse.json(
      { message: 'Too many requests. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfterSeconds.toString(),
        },
      },
    );
  }

  existing.count += 1;
  return NextResponse.next();
}
