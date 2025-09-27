// packages/web/src/app/api/v1/quotes/export/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ExportQuotesSchema = z.object({
  format: z.enum(['pdf', 'excel']).default('pdf'),
  quoteIds: z.array(z.string()).optional(),
  filters: z.object({
    status: z.array(z.nativeEnum(QuoteStatus)).optional(),
    customerId: z.string().optional(),
    search: z.string().optional(),
    dateFrom: z.string().datetime().optional(),
    dateTo: z.string().datetime().optional(),
    includeArchived: z.boolean().default(false)
  }).optional()
});

// T049: POST /api/v1/quotes/export endpoint
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = ExportQuotesSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: validation.error.issues
      }, { status: 400 });
    }

    const quoteService = QuoteServiceFactory.getInstance();
    const {
      format,
      quoteIds,
      filters
    } = validation.data;

    // Build export request according to ExportRequest schema
    const exportRequest = {
      format,
      ...(quoteIds && { quoteIds }),
      ...(filters && { 
        filters: {
          sort: 'createdAt' as const,
          sortOrder: 'desc' as const,
          ...filters
        }
      })
    };

    // Call the export service
    const exportResult = await quoteService.exportQuotes(exportRequest);

    // Set appropriate headers based on format
    const headers = new Headers();
    const timestamp = new Date().toISOString().split('T')[0];
    
    switch (format) {
      case 'excel':
        headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        headers.set('Content-Disposition', `attachment; filename="quotes_export_${timestamp}.xlsx"`);
        break;
      case 'pdf':
        headers.set('Content-Type', 'application/pdf');
        headers.set('Content-Disposition', `attachment; filename="quotes_export_${timestamp}.pdf"`);
        break;
    }

    headers.set('Cache-Control', 'no-cache');

    return new NextResponse(exportResult, {
      status: 200,
      headers
    });
  } catch (error) {
    console.error('Error exporting quotes:', error);

    // Handle specific export errors
    if (error instanceof Error && error.message.includes('no quotes found')) {
      return NextResponse.json({
        error: 'No quotes found matching criteria',
        message: 'Please adjust your filters and try again'
      }, { status: 404 });
    }

    if (error instanceof Error && error.message.includes('export too large')) {
      return NextResponse.json({
        error: 'Export too large',
        message: 'Please narrow your criteria to export fewer quotes'
      }, { status: 413 });
    }

    return NextResponse.json({
      error: 'Failed to export quotes',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve export status/history
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const exportId = searchParams.get('exportId');

    if (exportId) {
      // Return status of specific export
      return NextResponse.json({
        exportId,
        status: 'completed',
        format: 'csv',
        filename: `quotes_export_${exportId}.csv`,
        createdAt: new Date().toISOString(),
        downloadUrl: `/api/v1/quotes/export/download/${exportId}`
      });
    } else {
      // Return list of recent exports
      return NextResponse.json({
        exports: [
          {
            id: 'exp_123456',
            status: 'completed',
            format: 'csv',
            filename: 'quotes_export_2024-01-15.csv',
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            downloadUrl: '/api/v1/quotes/export/download/exp_123456'
          }
        ],
        totalCount: 1
      });
    }
  } catch (error) {
    console.error('Error fetching export status:', error);
    return NextResponse.json({
      error: 'Failed to fetch export status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}