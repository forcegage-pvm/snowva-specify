// packages/web/src/app/api/v1/quotes/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

const QuoteCreateSchema = z.object({
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  items: z.array(z.object({
    productId: z.string().optional(),
    description: z.string().min(1),
    quantity: z.number().positive(),
    unitPrice: z.number().min(0),
    taxable: z.boolean().default(true),
  })).min(1),
  taxRate: z.number().min(0).max(1).default(0.20),
  currency: z.string().length(3).default('GBP'),
  terms: z.string().default(''),
  notes: z.string().default('')
});

const QuoteListQuerySchema = z.object({
  page: z.string().optional().transform(val => val ? parseInt(val, 10) : 1),
  limit: z.string().optional().transform(val => val ? parseInt(val, 10) : 20),
  status: z.enum(['Draft', 'Pending', 'Approved', 'Rejected', 'Converted', 'Archived']).optional(),
  customerId: z.string().optional(),
  search: z.string().optional(),
  sortBy: z.enum(['createdAt', 'updatedAt', 'totalAmount', 'quoteNumber', 'customerName', 'status']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

// T041: GET /api/v1/quotes endpoint
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = Object.fromEntries(searchParams.entries());
    
    const validation = QuoteListQuerySchema.safeParse(params);
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid query parameters',
        details: validation.error.issues 
      }, { status: 400 });
    }

    const quoteService = QuoteServiceFactory.getInstance();
    const {
      page,
      limit,
      status,
      customerId,
      search,
      sortBy,
      sortOrder
    } = validation.data;

    const filters = {
      page,
      pageSize: limit,
      sort: (sortBy || 'createdAt') as 'createdAt' | 'updatedAt' | 'totalAmount' | 'quoteNumber' | 'customerName' | 'status',
      sortOrder,
      includeArchived: false,
      ...(status && { status: [status as QuoteStatus] }),
      ...(customerId && { customerId }),
      ...(search && { search }),
    };

    const result = await quoteService.getQuotes(filters);

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch quotes',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// T042: POST /api/v1/quotes endpoint  
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = QuoteCreateSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request body',
        details: validation.error.issues 
      }, { status: 400 });
    }

    const quoteService = QuoteServiceFactory.getInstance();
    const { customerId, customerName, items, taxRate, currency, terms, notes } = validation.data;
    
    const expiryDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    
    const newQuote = await quoteService.createQuote({
      customerId,
      customerName,
      lineItems: items.map(item => ({
        productId: item.productId,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxable: item.taxable,
        discount: 0,
        notes: '',
        category: '',
      })),
      taxRate,
      currency,
      expiryDate: expiryDate.toISOString(),
      validUntil: expiryDate.toISOString(),
      terms,
      notes,
    });

    return NextResponse.json(newQuote, { status: 201 });
  } catch (error) {
    console.error('Error creating quote:', error);
    return NextResponse.json({ 
      error: 'Failed to create quote',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
