// packages/web/src/app/api/v1/quotes/[quoteId]/status/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const StatusUpdateSchema = z.object({
  status: z.nativeEnum(QuoteStatus),
  reason: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional()
});

interface RouteParams {
  params: {
    quoteId: string;
  };
}

// T046: PATCH /api/v1/quotes/[quoteId]/status endpoint
export async function PATCH(
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
    const validation = StatusUpdateSchema.safeParse(body);

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

    const { status, reason, metadata } = validation.data;

    const updatedQuote = await quoteService.updateQuoteStatus(quoteId, {
      status,
      reason,
      metadata
    });

    return NextResponse.json(updatedQuote, { status: 200 });
  } catch (error) {
    console.error('Error updating quote status:', error);
    
    // Handle specific business rule violations
    if (error instanceof Error && error.message.includes('invalid status transition')) {
      return NextResponse.json({
        error: 'Invalid status transition',
        message: error.message
      }, { status: 422 });
    }

    if (error instanceof Error && error.message.includes('version mismatch')) {
      return NextResponse.json({
        error: 'Version conflict',
        message: 'Quote has been modified by another user. Please refresh and try again.'
      }, { status: 409 });
    }

    return NextResponse.json({
      error: 'Failed to update quote status',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve status history
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
    
    // Check if quote exists
    const existingQuote = await quoteService.getQuoteById(quoteId);
    if (!existingQuote) {
      return NextResponse.json({
        error: 'Quote not found'
      }, { status: 404 });
    }

    const statusHistory = await quoteService.getStatusHistory(quoteId);

    return NextResponse.json({
      quoteId,
      statusHistory
    }, { status: 200 });
  } catch (error) {
    console.error('Error fetching quote status history:', error);
    return NextResponse.json({
      error: 'Failed to fetch status history',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}