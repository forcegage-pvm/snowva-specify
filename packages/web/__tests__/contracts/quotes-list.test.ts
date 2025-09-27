import { GET } from '@/app/api/v1/quotes/route';
import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import { NextRequest } from 'next/server';

describe('GET /api/v1/quotes Contract', () => {
  let request: NextRequest;

  beforeEach(() => {
    // Setup mock request
    request = new NextRequest('http://localhost:3000/api/v1/quotes');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return 200 with quotes list structure', async () => {
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('quotes');
    expect(data).toHaveProperty('pagination');
    expect(data).toHaveProperty('summary');
    
    // Validate quotes array structure
    expect(Array.isArray(data.quotes)).toBe(true);
    
    // Validate pagination structure
    expect(data.pagination).toHaveProperty('page');
    expect(data.pagination).toHaveProperty('pageSize');
    expect(data.pagination).toHaveProperty('totalItems');
    expect(data.pagination).toHaveProperty('totalPages');
    
    // Validate summary structure
    expect(data.summary).toHaveProperty('totalQuotes');
    expect(data.summary).toHaveProperty('statusCounts');
  });

  it('should support pagination parameters', async () => {
    const requestWithPagination = new NextRequest(
      'http://localhost:3000/api/v1/quotes?page=2&pageSize=10'
    );
    
    const response = await GET(requestWithPagination);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data.pagination.page).toBe(2);
    expect(data.pagination.pageSize).toBe(10);
  });

  it('should support filtering by status', async () => {
    const requestWithFilter = new NextRequest(
      'http://localhost:3000/api/v1/quotes?status=Pending&status=Draft'
    );
    
    const response = await GET(requestWithFilter);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.quotes)).toBe(true);
  });

  it('should support search functionality', async () => {
    const requestWithSearch = new NextRequest(
      'http://localhost:3000/api/v1/quotes?search=ACME Corp'
    );
    
    const response = await GET(requestWithSearch);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.quotes)).toBe(true);
  });

  it('should support sorting parameters', async () => {
    const requestWithSort = new NextRequest(
      'http://localhost:3000/api/v1/quotes?sort=createdAt&sortOrder=desc'
    );
    
    const response = await GET(requestWithSort);
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(Array.isArray(data.quotes)).toBe(true);
  });

  it('should return 400 for invalid pagination parameters', async () => {
    const requestWithInvalidPage = new NextRequest(
      'http://localhost:3000/api/v1/quotes?page=-1'
    );
    
    const response = await GET(requestWithInvalidPage);
    expect(response.status).toBe(400);
    
    const data = await response.json();
    expect(data).toHaveProperty('error');
  });

  it('should validate quote list item structure', async () => {
    const response = await GET(request);
    const data = await response.json();
    
    if (data.quotes.length > 0) {
      const quote = data.quotes[0];
      
      // Required fields from QuoteListItem schema
      expect(quote).toHaveProperty('id');
      expect(quote).toHaveProperty('quoteNumber');
      expect(quote).toHaveProperty('customerId');
      expect(quote).toHaveProperty('customerName');
      expect(quote).toHaveProperty('totalAmount');
      expect(quote).toHaveProperty('currency');
      expect(quote).toHaveProperty('status');
      expect(quote).toHaveProperty('createdAt');
      expect(quote).toHaveProperty('updatedAt');
      
      // Validate data types
      expect(typeof quote.id).toBe('string');
      expect(typeof quote.quoteNumber).toBe('string');
      expect(typeof quote.customerId).toBe('string');
      expect(typeof quote.customerName).toBe('string');
      expect(typeof quote.totalAmount).toBe('number');
      expect(typeof quote.currency).toBe('string');
      expect(typeof quote.status).toBe('string');
      expect(typeof quote.createdAt).toBe('string');
      expect(typeof quote.updatedAt).toBe('string');
    }
  });
});