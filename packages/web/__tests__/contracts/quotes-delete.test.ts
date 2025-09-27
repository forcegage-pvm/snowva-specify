import { DELETE } from '@/app/api/v1/quotes/[quoteId]/route';
import { describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('DELETE /api/v1/quotes/{quoteId} Contract', () => {
  it('should delete quote and return 204', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/quote_123');
    const response = await DELETE(request, { params: { quoteId: 'quote_123' } });
    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existent quote', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/non_existent');
    const response = await DELETE(request, { params: { quoteId: 'non_existent' } });
    expect(response.status).toBe(404);
  });
});