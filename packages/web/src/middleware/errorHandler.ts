// packages/web/src/middleware/errorHandler.ts
import { NextRequest, NextResponse } from 'next/server';

export async function errorHandler(
  req: NextRequest,
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  try {
    return await handler(req);
  } catch (error) {
    console.error('[ERROR]', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
