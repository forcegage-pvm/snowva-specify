/**
 * Quote Preview API Route Implementation
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD006: PDF generation error handling
 * Addresses TD008: Performance optimization needed for quote preview
 * Addresses TD005: Async parameters not handled properly in Next.js 15
 */

import { QuotePdfService } from '@/services/quote-pdf-service';
import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/v1/quotes/[quoteId]/preview - Get optimized quote preview
 * Addresses TD008: Performance optimization needed for quote preview
 * Addresses TD005: Async parameters not handled properly in Next.js 15
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    // Handle async parameters in Next.js 15
    // Addresses TD005: Async parameters not handled properly in Next.js 15
    const { quoteId } = await params;

    // Validate quote ID
    if (!quoteId) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Quote ID is required',
          timestamp: new Date().toISOString(),
          statusCode: 400
        },
        success: false
      }, { status: 400 });
    }

    // UUID validation
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(quoteId)) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Invalid quote ID format',
          timestamp: new Date().toISOString(),
          statusCode: 400
        },
        success: false
      }, { status: 400 });
    }

    // Parse query parameters for optimization options
    const searchParams = request.nextUrl.searchParams;
    const regenerateThumbnail = searchParams.get('regenerateThumbnail') === 'true';
    const forceOptimization = searchParams.get('forceOptimization') === 'true';
    const cacheKey = searchParams.get('cacheKey') || undefined;

    const pdfService = new QuotePdfService();

    // Generate optimized preview
    // Addresses TD008: Performance optimization needed for quote preview
    const preview = await pdfService.generatePreview(quoteId, {
      regenerateThumbnail,
      forceOptimization,
      cacheKey
    });

    return NextResponse.json({
      data: preview,
      success: true,
      meta: {
        optimized: preview.metadata?.isOptimized || false,
        renderTime: preview.metadata?.renderTime,
        lastOptimizedAt: preview.metadata?.lastOptimizedAt
      }
    });
  } catch (error) {
    console.error('Quote Preview API Error:', error);
    
    // Handle different error types
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as any;
      return NextResponse.json({
        error: {
          code: apiError.code || 'INTERNAL_SERVER_ERROR',
          message: apiError.message || 'Failed to generate quote preview',
          timestamp: new Date().toISOString(),
          statusCode: apiError.statusCode || 500
        },
        success: false
      }, { status: apiError.statusCode || 500 });
    }

    return NextResponse.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to generate quote preview',
        timestamp: new Date().toISOString(),
        statusCode: 500
      },
      success: false
    }, { status: 500 });
  }
}

/**
 * POST /api/v1/quotes/[quoteId]/preview/optimize - Optimize quote preview
 * Addresses TD008: Performance optimization needed for quote preview
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    // Handle async parameters in Next.js 15
    const { quoteId } = await params;

    // Validate quote ID
    if (!quoteId) {
      return NextResponse.json({
        error: {
          code: 'VALIDATION_FAILED',
          message: 'Quote ID is required',
          timestamp: new Date().toISOString(),
          statusCode: 400
        },
        success: false
      }, { status: 400 });
    }

    const pdfService = new QuotePdfService();

    // Optimize quote preview
    const optimization = await pdfService.optimizePreview(quoteId);

    return NextResponse.json({
      data: optimization,
      success: true
    });
  } catch (error) {
    console.error('Quote Preview Optimization Error:', error);
    
    // Handle different error types
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const apiError = error as any;
      return NextResponse.json({
        error: {
          code: apiError.code || 'INTERNAL_SERVER_ERROR',
          message: apiError.message || 'Failed to optimize quote preview',
          timestamp: new Date().toISOString(),
          statusCode: apiError.statusCode || 500
        },
        success: false
      }, { status: apiError.statusCode || 500 });
    }

    return NextResponse.json({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'Failed to optimize quote preview',
        timestamp: new Date().toISOString(),
        statusCode: 500
      },
      success: false
    }, { status: 500 });
  }
}