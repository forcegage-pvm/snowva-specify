import { POST } from '@/app/api/v1/quotes/[quoteId]/convert/route';
import { describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('POST /api/v1/quotes/{quoteId}/convert Contract', () => {
  it('should convert quote to invoice', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/quote_123/convert');
    const response = await POST(request, { params: { quoteId: 'quote_123' } });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('invoice');
    expect(data).toHaveProperty('quote');
    expect(data.quote.status).toBe('Converted');
  });
});