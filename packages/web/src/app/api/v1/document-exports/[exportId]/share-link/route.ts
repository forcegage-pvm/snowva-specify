import { NextResponse } from 'next/server';

import { generateShareLink } from '@/services/DocumentExportService';

interface RouteContext {
  params: {
    exportId: string;
  };
}

export async function POST(_request: Request, context: RouteContext) {
  try {
    const result = await generateShareLink(context.params.exportId);

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
