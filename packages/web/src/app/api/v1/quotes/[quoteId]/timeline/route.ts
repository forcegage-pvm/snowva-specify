import { NextRequest, NextResponse } from 'next/server';

/**
 * Mock timeline data for development
 */
function generateMockTimeline(quoteId: string) {
  const now = new Date();
  const events = [
    {
      id: '1',
      type: 'created',
      title: 'Quote created',
      description: 'Draft quote initiated',
      timestamp: new Date(now.getTime() - 60 * 1000).toISOString(), // 1 minute ago
      user: {
        name: 'Current User',
        avatar: null
      }
    }
  ];

  return {
    events,
    total: events.length
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ quoteId: string }> }
) {
  try {
    const { quoteId } = await params;

    if (!quoteId) {
      return NextResponse.json(
        { error: 'Quote ID is required' },
        { status: 400 }
      );
    }

    // For now, return mock timeline data
    // In production, this would fetch from a database
    const timeline = generateMockTimeline(quoteId);

    return NextResponse.json(timeline);
  } catch (error) {
    console.error('Error fetching quote timeline:', error);
    return NextResponse.json(
      { error: 'Failed to fetch quote timeline' },
      { status: 500 }
    );
  }
}