// packages/web/src/middleware/auditLog.ts
import { NextRequest, NextResponse } from 'next/server';

export function auditLog(req: NextRequest) {
  console.log(`[AUDIT] ${req.method} ${req.nextUrl.pathname}`);
  return NextResponse.next();
}
