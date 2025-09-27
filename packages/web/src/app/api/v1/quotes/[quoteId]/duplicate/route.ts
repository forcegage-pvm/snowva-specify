// packages/web/src/app/api/v1/quotes/[quoteId]/duplicate/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const DuplicateQuoteSchema = z.object({
  customerId: z.string().min(1).optional(),
  customerName: z.string().min(1).optional(),  
  preserveLineItems: z.boolean().default(true),
  preserveTerms: z.boolean().default(true),
  preserveNotes: z.boolean().default(false),
  newValidUntil: z.string().datetime().optional()
});

interface RouteParams {
  params: {
    quoteId: string;
  };
}

// T047: POST /api/v1/quotes/[quoteId]/duplicate endpoint
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
    const validation = DuplicateQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: validation.error.issues
      }, { status: 400 });
    }

    const quoteService = QuoteServiceFactory.getInstance();
    
    // Check if original quote exists
    const originalQuote = await quoteService.getQuoteById(quoteId);
    if (!originalQuote) {
      return NextResponse.json({
        error: 'Original quote not found'
      }, { status: 404 });
    }

    const {
      customerId,
      customerName,
      preserveLineItems,
      preserveTerms,
      preserveNotes,
      newValidUntil
    } = validation.data;

    // Set expiry date (default 30 days from now if not provided)
    const expiryDate = newValidUntil 
      ? new Date(newValidUntil)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    // Create duplicate quote based on original
    const duplicateQuote = await quoteService.createQuote({
      customerId: customerId || originalQuote.customerId,
      customerName: customerName || originalQuote.customerName,
      lineItems: preserveLineItems ? originalQuote.lineItems.map(item => ({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxable: item.taxable || true,
        discount: item.discount || 0,
        notes: item.notes || '',
        category: item.category || ''
      })) : [],
      taxRate: originalQuote.taxRate,
      currency: originalQuote.currency,
      expiryDate: expiryDate.toISOString(),
      validUntil: expiryDate.toISOString(),
      terms: preserveTerms ? originalQuote.terms : '',
      notes: preserveNotes ? originalQuote.notes : ''
    });

    return NextResponse.json({
      originalQuoteId: quoteId,
      duplicatedQuote: duplicateQuote,
      message: 'Quote duplicated successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error duplicating quote:', error);
    return NextResponse.json({
      error: 'Failed to duplicate quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}