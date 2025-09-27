import { POST } from '@/app/api/v1/quotes/[quoteId]/duplicate/route';
import { describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('POST /api/v1/quotes/{quoteId}/duplicate Contract', () => {
  it('should duplicate quote successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/quote_123/duplicate');
    const response = await POST(request, { params: { quoteId: 'quote_123' } });
    
    expect(response.status).toBe(201);
    const data = await response.json();
    expect(data).toHaveProperty('quote');
    expect(data.quote.id).not.toBe('quote_123');
    expect(data.quote.status).toBe('Draft');
  });
});