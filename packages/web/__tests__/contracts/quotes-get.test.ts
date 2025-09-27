import { GET } from '@/app/api/v1/quotes/[quoteId]/route';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('GET /api/v1/quotes/{quoteId} Contract', () => {
  let validQuoteId: string;

  beforeEach(() => {
    validQuoteId = 'quote_123';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return quote details for valid ID', async () => {
    const request = new NextRequest(`http://localhost:3000/api/v1/quotes/${validQuoteId}`);
    
    const response = await GET(request, { params: { quoteId: validQuoteId } });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('quote');
    
    const quote = data.quote;
    expect(quote.id).toBe(validQuoteId);
    expect(quote).toHaveProperty('quoteNumber');
    expect(quote).toHaveProperty('customerId');
    expect(quote).toHaveProperty('customerName');
    expect(quote).toHaveProperty('lineItems');
    expect(quote).toHaveProperty('totalAmount');
    expect(quote).toHaveProperty('status');
    expect(quote).toHaveProperty('createdAt');
    expect(quote).toHaveProperty('updatedAt');
  });

  it('should return 404 for non-existent quote ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/non_existent');
    
    const response = await GET(request, { params: { quoteId: 'non_existent' } });
    
    expect(response.status).toBe(404);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for invalid quote ID format', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/invalid-id-format');
    
    const response = await GET(request, { params: { quoteId: 'invalid-id-format' } });
    
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });
});