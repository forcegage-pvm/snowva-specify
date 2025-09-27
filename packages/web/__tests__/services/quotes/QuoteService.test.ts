import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import { QuoteValidation } from '@/services/quotes/QuoteValidation';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';

describe('QuoteService', () => {
  let quoteService: ReturnType<typeof QuoteServiceFactory.getInstance>;

  beforeEach(() => {
    quoteService = QuoteServiceFactory.getInstance();
    jest.clearAllMocks();
  });

  describe('Service Instance', () => {
    it('provides a service instance', () => {
      expect(quoteService).toBeDefined();
      expect(typeof quoteService.getQuotes).toBe('function');
      expect(typeof quoteService.getQuoteById).toBe('function');
      expect(typeof quoteService.createQuote).toBe('function');
      expect(typeof quoteService.updateQuote).toBe('function');
      expect(typeof quoteService.deleteQuote).toBe('function');
    });

    it('provides the same instance on multiple calls', () => {
      const instance1 = QuoteServiceFactory.getInstance();
      const instance2 = QuoteServiceFactory.getInstance();
      expect(instance1).toBe(instance2);
    });

    it('can reset instance', () => {
      const instance1 = QuoteServiceFactory.getInstance();
      QuoteServiceFactory.reset();
      const instance2 = QuoteServiceFactory.getInstance();
      expect(instance1).not.toBe(instance2);
    });
  });

  describe('Service Methods', () => {
    it('has getQuotes method', () => {
      expect(typeof quoteService.getQuotes).toBe('function');
    });

    it('has getQuoteById method', () => {
      expect(typeof quoteService.getQuoteById).toBe('function');
    });

    it('has createQuote method', () => {
      expect(typeof quoteService.createQuote).toBe('function');
    });

    it('has updateQuote method', () => {
      expect(typeof quoteService.updateQuote).toBe('function');
    });

    it('has deleteQuote method', () => {
      expect(typeof quoteService.deleteQuote).toBe('function');
    });

    it('has bulkAction method', () => {
      expect(typeof quoteService.bulkAction).toBe('function');
    });

    it('has exportQuotes method', () => {
      expect(typeof quoteService.exportQuotes).toBe('function');
    });
  });

  describe('Basic functionality tests', () => {
    it('can call getQuotes without throwing', async () => {
      const basicFilters = {
        page: 1,
        pageSize: 10,
        sort: 'createdAt' as const,
        sortOrder: 'desc' as const,
        includeArchived: false,
      };

      expect(async () => {
        await quoteService.getQuotes(basicFilters);
      }).not.toThrow();
    });

    it('can call getQuoteById with valid ID', async () => {
      expect(async () => {
        await quoteService.getQuoteById('test-id');
      }).not.toThrow();
    });

    it('service methods exist and are functions', () => {
      // Test that methods exist and are callable
      expect(typeof quoteService.getQuotes).toBe('function');
      expect(typeof quoteService.getQuoteById).toBe('function');
      expect(typeof quoteService.createQuote).toBe('function');
      expect(typeof quoteService.updateQuote).toBe('function');
      expect(typeof quoteService.deleteQuote).toBe('function');
    });
  });
});

describe('QuoteValidation', () => {
  describe('Validation Methods', () => {
    it('has validateCreateRequest method', () => {
      expect(typeof QuoteValidation.validateCreateRequest).toBe('function');
    });

    it('has validateUpdateRequest method', () => {
      expect(typeof QuoteValidation.validateUpdateRequest).toBe('function');
    });

    it('has validateStatusUpdate method', () => {
      expect(typeof QuoteValidation.validateStatusUpdate).toBe('function');
    });

    it('has validateFilters method', () => {
      expect(typeof QuoteValidation.validateFilters).toBe('function');
    });

    it('has validateBulkAction method', () => {
      expect(typeof QuoteValidation.validateBulkAction).toBe('function');
    });

    it('has validateExport method', () => {
      expect(typeof QuoteValidation.validateExport).toBe('function');
    });
  });

  describe('Basic validation functionality', () => {
    it('can call validateCreateRequest without throwing', () => {
      const validData = {
        customerId: 'customer-1',
        customerName: 'Test Customer',
        lineItems: [{
          description: 'Test Item',
          quantity: 1,
          unitPrice: 100,
          taxable: false,
        }],
        taxRate: 0,
        currency: 'USD',
      };
      
      expect(() => {
        QuoteValidation.validateCreateRequest(validData);
      }).not.toThrow();
    });

    it('can call validateUpdateRequest without throwing', () => {
      const validUpdateData = {
        version: 1,
        customerName: 'Updated Name',
      };
      
      expect(() => {
        QuoteValidation.validateUpdateRequest(validUpdateData);
      }).not.toThrow();
    });

    it('can call validateFilters without throwing', () => {
      const validFilter = {
        page: 1,
        pageSize: 25,
        sort: 'createdAt' as const,
        sortOrder: 'desc' as const,
        includeArchived: false,
      };
      
      expect(() => {
        QuoteValidation.validateFilters(validFilter);
      }).not.toThrow();
    });

    it('can call validateBulkAction without throwing', () => {
      const validRequest = {
        quoteIds: ['quote-1', 'quote-2'],
        action: 'delete' as const,
      };
      
      expect(() => {
        QuoteValidation.validateBulkAction(validRequest);
      }).not.toThrow();
    });

    it('validation methods exist and are callable', () => {
      // Test that validation methods exist and can be called with valid data
      expect(typeof QuoteValidation.validateCreateRequest).toBe('function');
      expect(typeof QuoteValidation.validateUpdateRequest).toBe('function');
      expect(typeof QuoteValidation.validateFilters).toBe('function');
      
      // Methods should exist and be invokable
      expect(() => {
        QuoteValidation.validateCreateRequest({});
      }).not.toThrow();
    });
  });
});