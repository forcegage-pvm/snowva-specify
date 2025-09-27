// packages/web/src/app/api/v1/quotes/route.ts
import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { NextRequest, NextResponse } from 'next/server';
import { getRealQuotesData } from '@/lib/utils/realDataLoader';
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

    // Use real data for now, bypass service layer
    try {
      const allQuotes = await getRealQuotesData();
      
      // Apply basic filtering
      let filteredQuotes = allQuotes;
      
      if (status) {
        filteredQuotes = filteredQuotes.filter(quote => quote.status === status);
      }
      
      if (customerId) {
        filteredQuotes = filteredQuotes.filter(quote => quote.customerId === customerId);
      }
      
      if (search) {
        const searchLower = search.toLowerCase();
        filteredQuotes = filteredQuotes.filter(quote => 
          quote.customerName.toLowerCase().includes(searchLower) ||
          quote.quoteNumber.toLowerCase().includes(searchLower) ||
          quote.notes.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      if (sortBy) {
        filteredQuotes.sort((a, b) => {
          let aVal: any, bVal: any;
          
          switch (sortBy) {
            case 'createdAt':
            case 'updatedAt':
              aVal = new Date(a[sortBy]).getTime();
              bVal = new Date(b[sortBy]).getTime();
              break;
            case 'totalAmount':
              aVal = a.totalAmount;
              bVal = b.totalAmount;
              break;
            case 'quoteNumber':
            case 'customerName':
            case 'status':
              aVal = a[sortBy];
              bVal = b[sortBy];
              break;
            default:
              aVal = a.createdAt;
              bVal = b.createdAt;
          }
          
          if (sortOrder === 'asc') {
            return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
          } else {
            return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
          }
        });
      }
      
      // Apply pagination
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedQuotes = filteredQuotes.slice(startIndex, endIndex);
      
      const result = {
        quotes: paginatedQuotes,
        pagination: {
          page,
          pageSize: limit,
          totalItems: filteredQuotes.length,
          totalPages: Math.ceil(filteredQuotes.length / limit)
        },
        summary: {
          totalQuotes: filteredQuotes.length,
          totalAmount: filteredQuotes.reduce((sum, quote) => sum + quote.totalAmount, 0),
          averageAmount: filteredQuotes.length > 0 ? filteredQuotes.reduce((sum, quote) => sum + quote.totalAmount, 0) / filteredQuotes.length : 0,
          statusCounts: filteredQuotes.reduce((acc, quote) => {
            acc[quote.status] = (acc[quote.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>)
        }
      };
      
      return NextResponse.json(result, { status: 200 });
    } catch (realDataError) {
      console.warn('Failed to load real quotes data, falling back to service:', realDataError);
      
      // Fallback to service layer
      const result = await quoteService.getQuotes(filters);
      return NextResponse.json(result, { status: 200 });
    }
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
