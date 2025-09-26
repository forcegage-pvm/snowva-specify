import { NextResponse } from 'next/server';

import { getDocumentAuditTrail } from '@/services/DocumentExportService';

interface RouteContext {
  params: {
    exportId: string;
  };
}

function parseLimitParam(value: string | null, fallback: number, min = 1, max = 100): number {
  if (!value) {
    return fallback;
  }

  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) {
    return fallback;
  }

  return Math.min(Math.max(parsed, min), max);
}

const DEFAULT_LIMIT = 20;

export async function GET(request: Request, context: RouteContext) {
  try {
    const url = new URL(request.url);
    const { searchParams } = url;

    const cursor = searchParams.get('cursor');
    const limit = parseLimitParam(searchParams.get('limit'), DEFAULT_LIMIT, 1, 100);

    const result = await getDocumentAuditTrail(context.params.exportId, cursor, limit);

    return NextResponse.json({
      items: result.items.map((event) => ({
        id: event.id,
        timestamp: event.timestamp,
        actor: event.actor,
        action: event.action,
        context: event.context ? { ...event.context } : undefined,
      })),
      nextCursor: result.nextCursor,
    });
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      return NextResponse.json({ message: 'Document export not found' }, { status: 404 });
    }

    console.error('[document-exports][audit][GET]', error);
    return NextResponse.json({ message: 'Unable to load document audit trail' }, { status: 500 });
  }
}
