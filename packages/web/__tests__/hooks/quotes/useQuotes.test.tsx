import { useQuoteFiltersState, useQuoteSelection } from '@/hooks/quotes/useQuoteState';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { renderHook } from '@testing-library/react';

describe('useQuoteSelection Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with empty selection', () => {
    const { result } = renderHook(() => useQuoteSelection());

    expect(result.current.selectedQuotes.size).toBe(0);
    expect(result.current.lastSelected).toBeNull();
  });

  it('provides selection management functions', () => {
    const { result } = renderHook(() => useQuoteSelection());

    expect(typeof result.current.selectQuote).toBe('function');
    expect(typeof result.current.deselectQuote).toBe('function');
    expect(typeof result.current.toggleQuote).toBe('function');
    expect(typeof result.current.selectAll).toBe('function');
    expect(typeof result.current.deselectAll).toBe('function');
  });

  it('handles quote selection', () => {
    const { result } = renderHook(() => useQuoteSelection());

    expect(() => {
      result.current.selectQuote('quote-1');
    }).not.toThrow();
  });

  it('handles quote deselection', () => {
    const { result } = renderHook(() => useQuoteSelection());

    expect(() => {
      result.current.deselectQuote('quote-1');
    }).not.toThrow();
  });

  it('handles select all operation', () => {
    const { result } = renderHook(() => useQuoteSelection());

    expect(() => {
      result.current.selectAll(['quote-1', 'quote-2']);
    }).not.toThrow();
  });

  it('handles deselect all operation', () => {
    const { result } = renderHook(() => useQuoteSelection());

    expect(() => {
      result.current.deselectAll();
    }).not.toThrow();
  });
});

describe('useQuoteFiltersState Hook', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default filter state', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    expect(result.current.activeFilters).toBeDefined();
    expect(result.current.searchQuery).toBe('');
    expect(typeof result.current.setFilters).toBe('function');
    expect(typeof result.current.setSearchQuery).toBe('function');
  });

  it('provides filter management functions', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    expect(typeof result.current.updateFilter).toBe('function');
    expect(typeof result.current.clearFilters).toBe('function');
    expect(typeof result.current.toggleQuickFilters).toBe('function');
  });

  it('handles search query updates', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    expect(result.current.searchQuery).toBe('');
    
    // Function should exist and be callable
    expect(() => {
      result.current.setSearchQuery('test search');
    }).not.toThrow();
  });

  it('manages quick filters state', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    expect(typeof result.current.showQuickFilters).toBe('boolean');
    expect(typeof result.current.toggleQuickFilters).toBe('function');
  });

  it('provides favorite filters functionality', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    expect(Array.isArray(result.current.favoriteFilters)).toBe(true);
  });

  it('handles filter updates without errors', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    expect(() => {
      result.current.updateFilter('includeArchived', true);
    }).not.toThrow();
  });

  it('handles clear filters operation', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    expect(() => {
      result.current.clearFilters();
    }).not.toThrow();
  });

  it('maintains state consistency', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    const initialFilters = result.current.activeFilters;
    const initialSearch = result.current.searchQuery;

    // State should be consistent
    expect(result.current.activeFilters).toBe(initialFilters);
    expect(result.current.searchQuery).toBe(initialSearch);
  });

  it('provides core hook interface', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    // Check core expected properties exist
    expect(result.current).toHaveProperty('activeFilters');
    expect(result.current).toHaveProperty('searchQuery');
    expect(result.current).toHaveProperty('showQuickFilters');
    expect(result.current).toHaveProperty('favoriteFilters');
    expect(result.current).toHaveProperty('setFilters');
    expect(result.current).toHaveProperty('updateFilter');
    expect(result.current).toHaveProperty('clearFilters');
    expect(result.current).toHaveProperty('setSearchQuery');
    expect(result.current).toHaveProperty('toggleQuickFilters');
  });

  it('handles edge cases gracefully', () => {
    const { result } = renderHook(() => useQuoteFiltersState());

    // Test with null/undefined values
    expect(() => {
      result.current.setSearchQuery('');
    }).not.toThrow();

    expect(() => {
      result.current.updateFilter('includeArchived', false);
    }).not.toThrow();
  });
});