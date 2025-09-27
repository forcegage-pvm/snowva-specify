import { QuoteValidation } from '@/services/quotes/QuoteValidation';
import { describe, expect, it } from '@jest/globals';

describe('QuoteValidation', () => {
  describe('validateFilters', () => {
    it('should validate basic filters', () => {
      const validFilters = {
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false
      };
      
      const result = QuoteValidation.validateFilters(validFilters);
      expect(result.success).toBe(true);
    });

    it('should validate search filters', () => {
      const filtersWithSearch = {
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false,
        search: 'test query'
      };
      
      const result = QuoteValidation.validateFilters(filtersWithSearch);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.search).toBe('test query');
      }
    });

    it('should handle valid date formats', () => {
      const filtersWithDates = {
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false,
        dateFrom: '2025-01-01T00:00:00.000Z',
        dateTo: '2025-12-31T23:59:59.999Z'
      };
      
      const result = QuoteValidation.validateFilters(filtersWithDates);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date formats', () => {
      const filtersWithInvalidDates = {
        page: 1,
        pageSize: 25,
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false,
        dateFrom: 'invalid-date'
      };
      
      const result = QuoteValidation.validateFilters(filtersWithInvalidDates);
      expect(result.success).toBe(false);
    });

    it('should handle various date formats gracefully', () => {
      const testCases = [
        { date: '2025-01-01', shouldPass: true },
        { date: '2025-01-01T10:30:00Z', shouldPass: true },
        { date: '2025-01-01T10:30:00.000Z', shouldPass: true },
        { date: 'invalid', shouldPass: false },
        { date: '2025-13-01', shouldPass: false }, // invalid month
        { date: '', shouldPass: true }, // empty should be optional
      ];

      testCases.forEach(({ date, shouldPass }) => {
        const filters = {
          page: 1,
          pageSize: 25,
          sort: 'createdAt' as const,
          sortOrder: 'desc' as const,
          includeArchived: false,
          dateFrom: date
        };

        const result = QuoteValidation.validateFilters(filters);
        if (shouldPass) {
          expect(result.success).toBe(true);
        } else {
          expect(result.success).toBe(false);
        }
      });
    });

    it('should handle pagination edge cases', () => {
      const invalidPagination = {
        page: 0, // invalid
        pageSize: 100, // too large
        sort: 'createdAt',
        sortOrder: 'desc',
        includeArchived: false
      };
      
      const result = QuoteValidation.validateFilters(invalidPagination);
      expect(result.success).toBe(false);
    });
  });
});