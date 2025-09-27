import type { QuotesFilter } from '@/services/quotes/QuoteValidation';
import type { Quote } from '@/types/quotes/Quote';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';

export const createMockQuote = (overrides: Partial<Quote> = {}): Quote => ({
  id: 'quote-1',
  quoteNumber: 'QUO-2024-001',
  customerId: 'customer-1',
  customerName: 'Test Corporation',
  status: QuoteStatus.DRAFT,
  subtotal: 1000,
  taxAmount: 100,
  totalAmount: 1100,
  currency: 'USD',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
  lineItems: [],
  notes: '',
  internalNotes: '',
  tags: [],
  version: 1,
  statusHistory: [],
  ...overrides
});

export const createMockFilters = (overrides: Partial<QuotesFilter> = {}): QuotesFilter => ({
  page: 1,
  pageSize: 25,
  sort: 'createdAt',
  sortOrder: 'desc',
  includeArchived: false,
  ...overrides
});

// Test scenarios for edge cases
export const testScenarios = {
  search: {
    valid: ['test', '2024-03', 'ACME Corp', 'QUO-001'],
    invalid: ['', '   ', null, undefined],
    edge: ['very-long-search-query-that-might-cause-issues-with-api-limits-and-should-be-handled-gracefully']
  },
  dates: {
    valid: [
      '2025-01-01T00:00:00.000Z',
      '2025-12-31T23:59:59.999Z',
      '2025-06-15T12:30:00Z'
    ],
    invalid: [
      'invalid-date',
      '2025-13-01', // invalid month
      '2025-01-32', // invalid day  
      '2025-01-01T25:00:00Z', // invalid hour
      'not-a-date-at-all'
    ],
    edge: [
      '1900-01-01T00:00:00.000Z', // very old date
      '2100-12-31T23:59:59.999Z', // far future date
    ]
  }
};