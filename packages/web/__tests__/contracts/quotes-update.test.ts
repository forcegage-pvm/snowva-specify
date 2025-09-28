import { PUT } from '@/app/api/v1/quotes/[quoteId]/route';
import { Quote } from '@/types/quotes/Quote';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('PUT /api/v1/quotes/{quoteId} Contract', () => {
  let validQuoteId: string;
  let updateData: Partial<Quote>;

  beforeEach(() => {
    validQuoteId = 'quote_123';
    updateData = {
      customerName: 'Updated Corporation',
      lineItems: [
        {
          id: 'line_1',
          description: 'Updated Website Development',
          quantity: 1,
          unitPrice: 6000.00,
          totalPrice: 6000.00
        }
      ],
      subtotal: 6000.00,
      taxRate: 0.20,
      taxAmount: 1200.00,
      totalAmount: 7200.00,
      notes: 'Updated project requirements'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update quote with valid data', async () => {
    const request = new NextRequest(`http://localhost:3000/api/v1/quotes/${validQuoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { quoteId: validQuoteId } });
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('quote');
    expect(data.quote.id).toBe(validQuoteId);
    expect(data.quote.customerName).toBe(updateData.customerName);
    expect(data.quote.totalAmount).toBe(updateData.totalAmount);
  });

  it('should return 404 for non-existent quote', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes/non_existent', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    const response = await PUT(request, { params: { quoteId: 'non_existent' } });
    expect(response.status).toBe(404);
  });

  it('should return 400 for invalid update data', async () => {
    const invalidData = { totalAmount: -1000 };
    
    const request = new NextRequest(`http://localhost:3000/api/v1/quotes/${validQuoteId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    
    const response = await PUT(request, { params: { quoteId: validQuoteId } });
    expect(response.status).toBe(400);
  });
});