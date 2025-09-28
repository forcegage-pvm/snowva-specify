import { POST } from '@/app/api/v1/quotes/route';
import { Quote } from '@/types/quotes/Quote';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('POST /api/v1/quotes Contract', () => {
  let validQuoteData: Partial<Quote>;

  beforeEach(() => {
    validQuoteData = {
      customerId: 'customer_123',
      customerName: 'ACME Corporation',
      lineItems: [
        {
          id: 'line_1',
          description: 'Website Development',
          quantity: 1,
          unitPrice: 5000.00,
          totalPrice: 5000.00
        }
      ],
      subtotal: 5000.00,
      taxRate: 0.20,
      taxAmount: 1000.00,
      totalAmount: 6000.00,
      currency: 'GBP',
      expiryDate: new Date('2025-10-26'),
      validUntil: new Date('2025-10-26'),
      terms: 'Payment due within 30 days',
      notes: 'Initial quote for website development project'
    };
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create quote with valid data', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validQuoteData)
    });
    
    const response = await POST(request);
    
    expect(response.status).toBe(201);
    
    const data = await response.json();
    expect(data).toHaveProperty('quote');
    
    const quote = data.quote;
    expect(quote).toHaveProperty('id');
    expect(quote).toHaveProperty('quoteNumber');
    expect(quote.customerId).toBe(validQuoteData.customerId);
    expect(quote.customerName).toBe(validQuoteData.customerName);
    expect(quote.totalAmount).toBe(validQuoteData.totalAmount);
    expect(quote.currency).toBe(validQuoteData.currency);
    expect(quote.status).toBe('Draft');
    expect(quote).toHaveProperty('createdAt');
    expect(quote).toHaveProperty('updatedAt');
  });

  it('should return 400 for missing required fields', async () => {
    const incompleteData = { customerName: 'Test Customer' };
    
    const request = new NextRequest('http://localhost:3000/api/v1/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(incompleteData)
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data).toHaveProperty('details');
  });

  it('should return 400 for invalid line items', async () => {
    const invalidData = {
      ...validQuoteData,
      lineItems: [
        {
          description: 'Invalid item - missing required fields'
        }
      ]
    };
    
    const request = new NextRequest('http://localhost:3000/api/v1/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for invalid financial calculations', async () => {
    const invalidData = {
      ...validQuoteData,
      subtotal: 5000.00,
      taxAmount: 1000.00,
      totalAmount: 5000.00 // Incorrect total (should be 6000.00)
    };
    
    const request = new NextRequest('http://localhost:3000/api/v1/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
    expect(data.error).toContain('calculation');
  });

  it('should return 400 for invalid currency code', async () => {
    const invalidData = {
      ...validQuoteData,
      currency: 'INVALID'
    };
    
    const request = new NextRequest('http://localhost:3000/api/v1/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(invalidData)
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should return 400 for malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json'
    });
    
    const response = await POST(request);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should auto-generate quote number', async () => {
    const request = new NextRequest('http://localhost:3000/api/v1/quotes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(validQuoteData)
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(data.quote.quoteNumber).toMatch(/^Q-\d{4}-\d{3}$/);
  });
});