import { NextResponse } from 'next/server';

import { getDocumentExport } from '@/services/DocumentExportService';

interface RouteContext {
  params: Promise<{
    exportId: string;
  }>;
}

const SHARE_LINK_BASE_URL = 'https://app.snowva.com/share';

export async function GET(_request: Request, context: RouteContext) {
  const params = await context.params;
  try {
    const record = await getDocumentExport(params.exportId);

    const shareLink = record.shareLink
      ? {
          token: `${SHARE_LINK_BASE_URL}/${record.shareLink.id}`,
          expiresAt: record.shareLink.expiresAt,
          public: true,
        }
      : null;

    return NextResponse.json({
      id: record.id,
      title: record.title,
      documentType: record.documentType,
      customerBranch: {
        id: record.customerBranchId,
        name: record.customerBranchName,
      },
      createdAt: record.createdAt,
      deliveredChannels: [...record.deliveredChannels],
      status: record.status,
      failureReason: record.failureReason,
      preview: {
        assetUrl: record.preview.assetUrl,
        mimeType: record.preview.mimeType,
        fileSizeBytes: record.preview.fileSizeBytes,
      },
      shareLink,
      auditTrail: record.auditTrail.map((event) => ({
        id: event.id,
        timestamp: event.timestamp,
        actor: event.actor,
        action: event.action,
        context: event.context ? { ...event.context } : undefined,
      })),
    });
  } catch (error) {
    if (error instanceof Error && /not found/i.test(error.message)) {
      return NextResponse.json({ message: 'Document export not found' }, { status: 404 });
    }

    console.error('[document-exports][detail][GET]', error);
    return NextResponse.json({ message: 'Unable to load document export' }, { status: 500 });
  }
}
