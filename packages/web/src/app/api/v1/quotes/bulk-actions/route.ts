// packages/web/src/app/api/v1/quotes/bulk-actions/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const BulkActionSchema = z.object({
  action: z.enum(['updateStatus', 'archive', 'delete']),
  quoteIds: z.array(z.string()).min(1, 'At least one quote ID is required'),
  data: z.record(z.string(), z.any()).optional()
});

// T050: PATCH /api/v1/quotes/bulk-actions endpoint
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = BulkActionSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({
        error: 'Invalid request body',
        details: validation.error.issues
      }, { status: 400 });
    }

    const quoteService = QuoteServiceFactory.getInstance();
    const { action, quoteIds, data } = validation.data;

    // Validate that all quotes exist before performing bulk action
    const quotes = await Promise.all(
      quoteIds.map(id => quoteService.getQuoteById(id))
    );

    const notFoundIds = quoteIds.filter((id, index) => !quotes[index]);
    if (notFoundIds.length > 0) {
      return NextResponse.json({
        error: 'Some quotes not found',
        notFoundIds
      }, { status: 404 });
    }

    // Perform bulk action
    await quoteService.bulkAction({
      action,
      quoteIds,
      data
    });

    // Return summary of the action
    let message: string;
    switch (action) {
      case 'updateStatus':
        const newStatus = data?.status;
        message = `Successfully updated status to ${newStatus} for ${quoteIds.length} quotes`;
        break;
      case 'archive':
        message = `Successfully archived ${quoteIds.length} quotes`;
        break;
      case 'delete':
        message = `Successfully deleted ${quoteIds.length} quotes`;
        break;
      default:
        message = `Successfully performed ${action} on ${quoteIds.length} quotes`;
    }

    return NextResponse.json({
      success: true,
      action,
      affectedQuoteIds: quoteIds,
      affectedCount: quoteIds.length,
      message,
      data
    }, { status: 200 });
  } catch (error) {
    console.error('Error performing bulk action:', error);

    // Handle specific business rule violations
    if (error instanceof Error && error.message.includes('invalid status transition')) {
      return NextResponse.json({
        error: 'Invalid bulk operation',
        message: 'Some quotes cannot be transitioned to the requested status',
        details: error.message
      }, { status: 422 });
    }

    if (error instanceof Error && error.message.includes('permission denied')) {
      return NextResponse.json({
        error: 'Permission denied',
        message: 'You do not have permission to perform this bulk action'
      }, { status: 403 });
    }

    if (error instanceof Error && error.message.includes('too many quotes')) {
      return NextResponse.json({
        error: 'Bulk action too large',
        message: 'Please select fewer quotes and try again'
      }, { status: 413 });
    }

    return NextResponse.json({
      error: 'Failed to perform bulk action',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// GET method to retrieve available bulk actions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const quoteIds = searchParams.get('quoteIds')?.split(',') || [];

    if (quoteIds.length === 0) {
      return NextResponse.json({
        availableActions: [
          {
            action: 'updateStatus',
            label: 'Update Status',
            description: 'Change the status of selected quotes',
            requiresData: true,
            dataFields: ['status', 'reason']
          },
          {
            action: 'archive',
            label: 'Archive',
            description: 'Archive selected quotes',
            requiresData: false
          },
          {
            action: 'delete',
            label: 'Delete',
            description: 'Permanently delete selected quotes',
            requiresData: false,
            dangerous: true
          }
        ]
      });
    }

    // If specific quotes are provided, analyze what actions are available
    const quoteService = QuoteServiceFactory.getInstance();
    const quotes = await Promise.all(
      quoteIds.map(id => quoteService.getQuoteById(id))
    );

    const validQuotes = quotes.filter(Boolean);
    const statuses = Array.from(new Set(validQuotes.map(q => q!.status)));

    // Determine available actions based on current statuses
    const availableActions = [
      {
        action: 'updateStatus',
        label: 'Update Status',
        description: `Change status for ${validQuotes.length} quotes`,
        requiresData: true,
        dataFields: ['status', 'reason'],
        availableStatuses: Object.values(QuoteStatus)
      },
      {
        action: 'archive',
        label: 'Archive',
        description: `Archive ${validQuotes.length} quotes`,
        requiresData: false,
        enabled: !statuses.includes(QuoteStatus.Archived)
      }
    ];

    // Only allow delete for draft quotes
    const canDelete = validQuotes.every(q => q!.status === QuoteStatus.Draft);
    if (canDelete) {
      availableActions.push({
        action: 'delete',
        label: 'Delete',
        description: `Delete ${validQuotes.length} draft quotes`,
        requiresData: false,
        enabled: true,
        dangerous: true
      });
    }

    return NextResponse.json({
      selectedQuotes: validQuotes.length,
      currentStatuses: statuses,
      availableActions
    });
  } catch (error) {
    console.error('Error fetching bulk action options:', error);
    return NextResponse.json({
      error: 'Failed to fetch bulk action options',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}