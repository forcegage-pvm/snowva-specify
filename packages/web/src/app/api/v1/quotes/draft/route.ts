import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.customerId || !body.lineItems || !Array.isArray(body.lineItems)) {
      return NextResponse.json(
        { error: 'Missing required fields: customerId and lineItems are required' },
        { status: 400 }
      );
    }

    // Generate a draft quote ID
    const draftId = `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Calculate totals
    const subtotal = (body.lineItems as Array<{ quantity: number; unitPriceExVat?: number; unitPrice?: number }>).reduce((sum: number, item) => {
      return sum + (item.quantity * (item.unitPriceExVat || item.unitPrice || 0));
    }, 0);
    
    const vatAmount = subtotal * (body.vatRate || 0.15);
    const total = subtotal + vatAmount;

    // Create draft quote object with the expected structure
    const draftQuote = {
      id: draftId,
      customerId: body.customerId,
      branchId: body.branchId,
      lineItems: body.lineItems,
      totals: {
        subtotalExVat: subtotal,
        vatAmount: vatAmount,
        total: total
      },
      vatRate: body.vatRate || 0.15,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      notes: body.notes || '',
      validUntil: body.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days from now
    };

    // In a real application, you would save this to a database
    // For now, we'll just return the draft quote with the generated ID
    
    return NextResponse.json({
      success: true,
      quote: draftQuote,
      message: 'Draft quote saved successfully'
    });
    
  } catch (error) {
    console.error('Error saving draft quote:', error);
    return NextResponse.json(
      { error: 'Failed to save draft quote' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Handle GET requests for retrieving draft quotes
  const { searchParams } = new URL(request.url);
  const draftId = searchParams.get('id');
  
  if (draftId) {
    // In a real application, you would fetch from database
    // For now, return a mock response
    return NextResponse.json({
      error: 'Draft not found'
    }, { status: 404 });
  }
  
  // Return list of drafts (empty for now)
  return NextResponse.json({
    drafts: []
  });
}