import { POST } from '@/app/api/v1/quotes/export/route';
import { describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('POST /api/v1/quotes/export Contract', () => {
  it('should export quotes to PDF', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        format: 'pdf',
        quoteIds: ['quote_123', 'quote_456']
      })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/pdf');
  });

  it('should export quotes to Excel', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/export', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        format: 'excel',
        filters: { status: ['Pending'] }
      })
    });
    
    const response = await POST(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Type')).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  });
});