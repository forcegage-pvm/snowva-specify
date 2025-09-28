import { NextResponse } from 'next/server';

import { generateShareLink } from '@/services/DocumentExportService';

interface RouteContext {
  params: Promise<{
    exportId: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const params = await context.params;
  try {
    const result = await generateShareLink(params.exportId);

    return NextResponse.json({
      token: result.token,
      expiresAt: result.expiresAt,
    });
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      return NextResponse.json({ message: 'Document export not found' }, { status: 404 });
    }

    console.error('[document-exports][share-link][POST]', error);
    return NextResponse.json({ message: 'Unable to generate share link' }, { status: 500 });
  }
}
