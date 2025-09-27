import { PATCH } from '@/app/api/v1/quotes/bulk-actions/route';
import { describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('PATCH /api/v1/quotes/bulk-actions Contract', () => {
  it('should perform bulk status update', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/bulk-actions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateStatus',
        quoteIds: ['quote_123', 'quote_456'],
        data: { status: 'Approved' }
      })
    });
    
    const response = await PATCH(request);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('updatedQuotes');
    expect(data.updatedQuotes.length).toBe(2);
  });

  it('should perform bulk archive', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/bulk-actions', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'archive',
        quoteIds: ['quote_123', 'quote_456']
      })
    });
    
    const response = await PATCH(request);
    expect(response.status).toBe(200);
  });
});