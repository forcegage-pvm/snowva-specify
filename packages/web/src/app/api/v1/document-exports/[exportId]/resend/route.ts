import { NextResponse } from 'next/server';

import { resendDocumentExport } from '@/services/DocumentExportService';

interface RouteContext {
  params: Promise<{
    exportId: string;
  }>;
}

export async function POST(_request: Request, context: RouteContext) {
  const params = await context.params;
  try {
    const result = await resendDocumentExport(params.exportId);

    return NextResponse.json({
      status: result.status,
      resentAt: result.resentAt,
      deliveredChannels: result.deliveredChannels,
      auditEventId: result.auditEventId,
    });
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      return NextResponse.json({ message: 'Document export not found' }, { status: 404 });
    }

    console.error('[document-exports][resend][POST]', error);
    return NextResponse.json({ message: 'Unable to resend document export' }, { status: 500 });
  }
}
