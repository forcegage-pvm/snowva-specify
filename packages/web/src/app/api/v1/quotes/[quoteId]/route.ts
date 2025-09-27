// packages/web/src/app/api/v1/quotes/[quoteId]/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const UpdateQuoteSchema = z.object({
  version: z.number().min(1),
  customerId: z.string().min(1).optional(),
  customerName: z.string().min(1).optional(),
  lineItems: z.array(z.object({
    productId: z.string().optional(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    taxable: z.boolean().default(true),
    discount: z.number().min(0).max(100).optional(),
    notes: z.string().optional(),
    category: z.string().optional(),
  })).optional(),
  taxRate: z.number().min(0).max(1).optional(),
  currency: z.string().length(3).optional(),
  expiryDate: z.string().datetime().optional(),
  validUntil: z.string().datetime().optional(),
  terms: z.string().optional(),
  notes: z.string().optional()
});

interface RouteParams {
  params: {
    quoteId: string;
  };
}

// T043: GET /api/v1/quotes/[quoteId] endpoint
export async function GET(
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

    const quoteService = QuoteServiceFactory.getInstance();
    const quote = await quoteService.getQuoteById(quoteId);

    if (!quote) {
      return NextResponse.json({
        error: 'Quote not found'
      }, { status: 404 });
    }

    return NextResponse.json(quote, { status: 200 });
  } catch (error) {
    console.error('Error fetching quote:', error);
    return NextResponse.json({
      error: 'Failed to fetch quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// T044: PUT /api/v1/quotes/[quoteId] endpoint
export async function PUT(
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
    const validation = UpdateQuoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: validation.error.issues
      }, { status: 400 });
    }

    const quoteService = QuoteServiceFactory.getInstance();
    
    // Check if quote exists
    const existingQuote = await quoteService.getQuoteById(quoteId);
    if (!existingQuote) {
      return NextResponse.json({
        error: 'Quote not found'
      }, { status: 404 });
    }

    const updatedQuote = await quoteService.updateQuote(quoteId, validation.data);

    return NextResponse.json(updatedQuote, { status: 200 });
  } catch (error) {
    console.error('Error updating quote:', error);
    return NextResponse.json({
      error: 'Failed to update quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// T045: DELETE /api/v1/quotes/[quoteId] endpoint
export async function DELETE(
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

    const quoteService = QuoteServiceFactory.getInstance();
    
    // Check if quote exists
    const existingQuote = await quoteService.getQuoteById(quoteId);
    if (!existingQuote) {
      return NextResponse.json({
        error: 'Quote not found'
      }, { status: 404 });
    }

    await quoteService.deleteQuote(quoteId);

    return NextResponse.json({
      message: 'Quote deleted successfully'
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting quote:', error);
    return NextResponse.json({
      error: 'Failed to delete quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}