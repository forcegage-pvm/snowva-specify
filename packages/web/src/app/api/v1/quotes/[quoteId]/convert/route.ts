// packages/web/src/app/api/v1/quotes/[quoteId]/convert/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const ConvertQuoteSchema = z.object({
  convertTo: z.enum(['invoice', 'order']).default('invoice'),
  preserveLineItems: z.boolean().default(true),
  preserveTerms: z.boolean().default(true),
  preserveNotes: z.boolean().default(true),
  invoiceDate: z.string().datetime().optional(),
  dueDate: z.string().datetime().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

interface RouteParams {
  params: {
    quoteId: string;
  };
}

// T048: POST /api/v1/quotes/[quoteId]/convert endpoint
export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { quoteId } = params;

    if (!quoteId) {
      return NextResponse.json({
        error: 'Quote ID is required'
      }, { status: 400 });
    }

    const body = await request.json();
    const validation = ConvertQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: validation.error.issues
      }, { status: 400 });
    }

    const quoteService = QuoteServiceFactory.getInstance();
    
    // Check if quote exists and is in correct status
    const originalQuote = await quoteService.getQuoteById(quoteId);
    if (!originalQuote) {
      return NextResponse.json({
        error: 'Quote not found'
      }, { status: 404 });
    }

    // Verify quote is in approved status
    if (originalQuote.status !== QuoteStatus.Approved) {
      return NextResponse.json({
        error: 'Quote must be approved before conversion',
        currentStatus: originalQuote.status,
        requiredStatus: QuoteStatus.Approved
      }, { status: 422 });
    }

    const {
      convertTo,
      preserveLineItems,
      preserveTerms,
      preserveNotes,
      invoiceDate,
      dueDate,
      metadata
    } = validation.data;

    // Mock conversion logic - in a real system this would:
    // 1. Create invoice/order record in the appropriate service
    // 2. Update quote status to converted
    // 3. Link the two records
    
    // For now, we'll simulate the process by updating the quote status
    const updatedQuote = await quoteService.updateQuoteStatus(quoteId, {
      status: QuoteStatus.Converted,
      reason: `Converted to ${convertTo}`,
      metadata: {
        convertedTo: convertTo,
        convertedAt: new Date().toISOString(),
        preserveLineItems,
        preserveTerms,
        preserveNotes,
        ...(invoiceDate && { invoiceDate }),
        ...(dueDate && { dueDate }),
        ...metadata
      }
    });

    // Mock response - in reality would include actual invoice/order data
    const mockConvertedDocument = {
      id: `${convertTo}-${Date.now()}`,
      type: convertTo,
      originalQuoteId: quoteId,
      customerId: originalQuote.customerId,
      customerName: originalQuote.customerName,
      lineItems: preserveLineItems ? originalQuote.lineItems : [],
      totalAmount: originalQuote.totalAmount,
      currency: originalQuote.currency,
      terms: preserveTerms ? originalQuote.terms : '',
      notes: preserveNotes ? originalQuote.notes : '',
      createdAt: new Date().toISOString(),
      ...(convertTo === 'invoice' && {
        invoiceDate: invoiceDate || new Date().toISOString(),
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      })
    };

    return NextResponse.json({
      originalQuote: updatedQuote,
      convertedDocument: mockConvertedDocument,
      message: `Quote successfully converted to ${convertTo}`
    }, { status: 201 });
  } catch (error) {
    console.error('Error converting quote:', error);
    
    // Handle business rule violations
    if (error instanceof Error && error.message.includes('invalid status transition')) {
      return NextResponse.json({
        error: 'Invalid conversion operation',
        message: error.message
      }, { status: 422 });
    }

    return NextResponse.json({
      error: 'Failed to convert quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}