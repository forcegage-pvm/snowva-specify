import { PATCH } from '@/app/api/v1/quotes/[quoteId]/status/route';
import { describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('PATCH /api/v1/quotes/{quoteId}/status Contract', () => {
  it('should update quote status', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/quote_123/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'Pending' })
    });
    
    const response = await PATCH(request, { params: { quoteId: 'quote_123' } });
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.quote.status).toBe('Pending');
  });

  it('should return 400 for invalid status', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/quote_123/status', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'InvalidStatus' })
    });
    
    const response = await PATCH(request, { params: { quoteId: 'quote_123' } });
    expect(response.status).toBe(400);
  });
});