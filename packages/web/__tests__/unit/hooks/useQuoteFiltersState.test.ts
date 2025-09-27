import { useQuoteFiltersState } from '@/hooks/quotes/useQuoteState';
import { describe, expect, it } from '@jest/globals';
import { act, renderHook } from '@testing-library/react';

describe('useQuoteFiltersState', () => {
  describe('Search Integration', () => {
    it('should merge search query into active filters', async () => {
      const { result } = renderHook(() => useQuoteFiltersState());
      
      // Set search query
      act(() => {
        result.current.setSearchQuery('test search');
      });
      
      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 350));
      });
      
      // Verify search is in active filters
      expect(result.current.activeFilters.search).toBe('test search');
    });

    it('should debounce search queries', async () => {
      const { result } = renderHook(() => useQuoteFiltersState());
      
      // Rapid changes
      act(() => {
        result.current.setSearchQuery('a');
      });
      act(() => {
        result.current.setSearchQuery('ab');
      });
      act(() => {
        result.current.setSearchQuery('abc');
      });
      
      // Should not be updated immediately
      expect(result.current.activeFilters.search).toBeUndefined();
      
      // Wait for debounce
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 350));
      });
      
      // Should have final value
      expect(result.current.activeFilters.search).toBe('abc');
    });

    it('should exclude empty search from filters', async () => {
      const { result } = renderHook(() => useQuoteFiltersState());
      
      act(() => {
        result.current.setSearchQuery('   '); // whitespace only
      });
      
      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 350));
      });
      
      expect(result.current.activeFilters.search).toBeUndefined();
    });
  });

  describe('Date Validation', () => {
    it('should remove invalid dateFrom from filters', () => {
      const { result } = renderHook(() => useQuoteFiltersState());
      
      act(() => {
        result.current.setFilters({ 
          dateFrom: 'invalid-date',
          dateTo: '2025-01-01T00:00:00.000Z'
        });
      });
      
      expect(result.current.activeFilters.dateFrom).toBeUndefined();
      expect(result.current.activeFilters.dateTo).toBe('2025-01-01T00:00:00.000Z');
    });

    it('should keep valid ISO dates', () => {
      const { result } = renderHook(() => useQuoteFiltersState());
      const validDate = '2025-01-01T00:00:00.000Z';
      
      act(() => {
        result.current.setFilters({ dateFrom: validDate });
      });
      
      expect(result.current.activeFilters.dateFrom).toBe(validDate);
    });
  });
});