// packages/web/src/middleware/rateLimit.ts
import rateLimit from 'express-rate-limit';
import { NextRequest, NextResponse } from 'next/server';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

export async function rateLimiter(req: NextRequest) {
  // This is a simplified adaptation for Next.js middleware
  // In a real app, you might need a more sophisticated solution
  // that works with the Next.js Edge runtime.
  return new Promise((resolve, reject) => {
    // @ts-ignore
    limiter(req, new NextResponse(), (result: any) => {
      if (result instanceof Error) {
        return reject(result);
      }
      resolve(NextResponse.next());
    });
  });
}
