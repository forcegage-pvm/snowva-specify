'use client';

import type { QuotesFilter } from '@/services/quotes/QuoteValidation';
import type { Quote } from '@/types/quotes/Quote';
import { useCallback, useEffect, useMemo, useState } from 'react';

// Helper function to validate ISO datetime strings
function isValidISODateTime(dateStr: string): boolean {
  if (!dateStr) return false;
  try {
    const date = new Date(dateStr);
    return date.toISOString() === dateStr;
  } catch {
    return false;
  }
}

/**
 * Hook for managing quote selection state
 */
export function useQuoteSelection() {
  const [selectedQuotes, setSelectedQuotes] = useState<Set<string>>(new Set());
  const [lastSelected, setLastSelected] = useState<string | null>(null);
  
  const selectQuote = useCallback((id: string) => {
    setSelectedQuotes(prev => {
      const newSelected = new Set(prev);
      newSelected.add(id);
      return newSelected;
    });
    setLastSelected(id);
  }, []);
  
  const deselectQuote = useCallback((id: string) => {
    setSelectedQuotes(prev => {
      const newSelected = new Set(prev);
      newSelected.delete(id);
      return newSelected;
    });
    setLastSelected(prev => prev === id ? null : prev);
  }, []);
  
  const toggleQuote = useCallback((id: string) => {
    if (selectedQuotes.has(id)) {
      deselectQuote(id);
    } else {
      selectQuote(id);
    }
  }, [selectedQuotes, selectQuote, deselectQuote]);
  
  const selectAll = useCallback((quoteIds: string[]) => {
    setSelectedQuotes(new Set(quoteIds));
    setLastSelected(null);
  }, []);
  
  const deselectAll = useCallback(() => {
    setSelectedQuotes(new Set());
    setLastSelected(null);
  }, []);
  
  const selectRange = useCallback((startId: string, endId: string, quoteIds: string[]) => {
    const startIndex = quoteIds.indexOf(startId);
    const endIndex = quoteIds.indexOf(endId);
    
    if (startIndex === -1 || endIndex === -1) return;
    
    const [minIndex, maxIndex] = [Math.min(startIndex, endIndex), Math.max(startIndex, endIndex)];
    const rangeIds = quoteIds.slice(minIndex, maxIndex + 1);
    
    setSelectedQuotes(prev => {
      const newSelected = new Set(prev);
      rangeIds.forEach(id => newSelected.add(id));
      return newSelected;
    });
    setLastSelected(endId);
  }, []);
  
  const isSelected = useCallback((id: string) => selectedQuotes.has(id), [selectedQuotes]);
  const getSelectedCount = useCallback(() => selectedQuotes.size, [selectedQuotes]);
  const isAllSelected = useCallback((totalIds: string[]) => {
    return totalIds.length > 0 && totalIds.every(id => selectedQuotes.has(id));
  }, [selectedQuotes]);
  
  return {
    selectedQuotes,
    lastSelected,
    selectQuote,
    deselectQuote,
    toggleQuote,
    selectAll,
    deselectAll,
    selectRange,
    isSelected,
    getSelectedCount,
    isAllSelected
  };
}

/**
 * Hook for managing quote view preferences
 */
export function useQuoteView() {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'table'>('table');
  const [listDensity, setListDensity] = useState<'compact' | 'comfortable' | 'spacious'>('comfortable');
  const [showAvatars, setShowAvatars] = useState(true);
  const [showStatusBadges, setShowStatusBadges] = useState(true);
  const [visibleColumns, setVisibleColumns] = useState<string[]>([
    'quoteNumber',
    'customerName', 
    'totalAmount',
    'status',
    'createdAt',
    'expiryDate'
  ]);
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({
    quoteNumber: 120,
    customerName: 200,
    totalAmount: 120,
    status: 100,
    createdAt: 140,
    expiryDate: 140
  });
  const [sortColumn, setSortColumn] = useState<string>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [gridSize, setGridSize] = useState<'small' | 'medium' | 'large'>('medium');
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quoteViewPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setViewMode(preferences.viewMode || 'table');
        setListDensity(preferences.listDensity || 'comfortable');
        setShowAvatars(preferences.showAvatars ?? true);
        setShowStatusBadges(preferences.showStatusBadges ?? true);
        setVisibleColumns(preferences.visibleColumns || [
          'quoteNumber', 'customerName', 'totalAmount', 'status', 'createdAt', 'expiryDate'
        ]);
        setColumnWidths(preferences.columnWidths || {});
        setGridSize(preferences.gridSize || 'medium');
      }
    } catch (error) {
      console.warn('Failed to load quote view preferences');
    }
  }, []);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const preferences = {
        viewMode,
        listDensity,
        showAvatars,
        showStatusBadges,
        visibleColumns,
        columnWidths,
        gridSize
      };
      
      localStorage.setItem('quoteViewPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save quote view preferences');
    }
  }, [viewMode, listDensity, showAvatars, showStatusBadges, visibleColumns, columnWidths, gridSize]);
  
  const toggleAvatars = useCallback(() => setShowAvatars(prev => !prev), []);
  const toggleStatusBadges = useCallback(() => setShowStatusBadges(prev => !prev), []);
  
  const setColumnWidth = useCallback((column: string, width: number) => {
    setColumnWidths(prev => ({ ...prev, [column]: width }));
  }, []);
  
  const setSorting = useCallback((column: string, direction: 'asc' | 'desc') => {
    setSortColumn(column);
    setSortDirection(direction);
  }, []);
  
  const clearSorting = useCallback(() => {
    setSortColumn('createdAt');
    setSortDirection('desc');
  }, []);
  
  const resetToDefaults = useCallback(() => {
    setViewMode('table');
    setListDensity('comfortable');
    setShowAvatars(true);
    setShowStatusBadges(true);
    setVisibleColumns(['quoteNumber', 'customerName', 'totalAmount', 'status', 'createdAt', 'expiryDate']);
    setColumnWidths({
      quoteNumber: 120,
      customerName: 200,
      totalAmount: 120,
      status: 100,
      createdAt: 140,
      expiryDate: 140
    });
    setSortColumn('createdAt');
    setSortDirection('desc');
    setGridSize('medium');
  }, []);
  
  return {
    // State
    viewMode,
    listDensity,
    showAvatars,
    showStatusBadges,
    visibleColumns,
    columnWidths,
    sortColumn,
    sortDirection,
    gridSize,
    
    // Actions
    setViewMode,
    setListDensity,
    toggleAvatars,
    toggleStatusBadges,
    setVisibleColumns,
    setColumnWidth,
    setSorting,
    clearSorting,
    setGridSize,
    resetToDefaults
  };
}

/**
 * Hook for managing quote filter state
 */
export function useQuoteFiltersState() {
  const [activeFilters, setActiveFilters] = useState<QuotesFilter>({
    page: 1,
    pageSize: 25,
    sort: 'createdAt',
    sortOrder: 'desc',
    includeArchived: false
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchDebouncedQuery, setSearchDebouncedQuery] = useState('');
  const [showQuickFilters, setShowQuickFilters] = useState(false);
  const [favoriteFilters, setFavoriteFilters] = useState<QuotesFilter[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [totalItems, setTotalItems] = useState(0);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  // Merge search into active filters
  const combinedFilters = useMemo(() => {
    const filters = { ...activeFilters };
    if (searchDebouncedQuery.trim()) {
      filters.search = searchDebouncedQuery.trim();
    }
    // Clean up any invalid date fields
    if (filters.dateFrom && !isValidISODateTime(filters.dateFrom)) {
      delete filters.dateFrom;
    }
    if (filters.dateTo && !isValidISODateTime(filters.dateTo)) {
      delete filters.dateTo;
    }
    return filters;
  }, [activeFilters, searchDebouncedQuery]);
  
  // Load preferences from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('quoteFilterPreferences');
      if (saved) {
        const preferences = JSON.parse(saved);
        setFavoriteFilters(preferences.favoriteFilters || []);
        setShowQuickFilters(preferences.showQuickFilters ?? false);
        setPageSize(preferences.pageSize || 25);
      }
    } catch (error) {
      console.warn('Failed to load quote filter preferences');
    }
  }, []);
  
  // Save preferences to localStorage when they change
  useEffect(() => {
    try {
      const preferences = {
        favoriteFilters,
        showQuickFilters,
        pageSize
      };
      
      localStorage.setItem('quoteFilterPreferences', JSON.stringify(preferences));
    } catch (error) {
      console.warn('Failed to save quote filter preferences');
    }
  }, [favoriteFilters, showQuickFilters, pageSize]);
  
  const setFilters = useCallback((filters: Partial<QuotesFilter>) => {
    setActiveFilters(prev => ({ ...prev, ...filters }));
  }, []);
  
  const updateFilter = useCallback((key: keyof QuotesFilter, value: QuotesFilter[keyof QuotesFilter]) => {
    setActiveFilters(prev => ({ ...prev, [key]: value }));
  }, []);
  
  const clearFilters = useCallback(() => {
    setActiveFilters({
      page: 1,
      pageSize: 25,
      sort: 'createdAt',
      sortOrder: 'desc',
      includeArchived: false
    });
    setSearchQuery('');
    setSearchDebouncedQuery('');
    setCurrentPage(1);
  }, []);
  
  const toggleQuickFilters = useCallback(() => {
    setShowQuickFilters(prev => !prev);
  }, []);
  
  const addFavoriteFilter = useCallback((filter: QuotesFilter) => {
    setFavoriteFilters(prev => [...prev, filter]);
  }, []);
  
  const removeFavoriteFilter = useCallback((index: number) => {
    setFavoriteFilters(prev => prev.filter((_, i) => i !== index));
  }, []);
  
  const updatePageSize = useCallback((size: number) => {
    setPageSize(size);
    setCurrentPage(1);
  }, []);
  
  const resetPagination = useCallback(() => {
    setCurrentPage(1);
    setTotalItems(0);
  }, []);
  
  return {
    // State
    activeFilters: combinedFilters,
    searchQuery,
    searchDebouncedQuery,
    showQuickFilters,
    favoriteFilters,
    currentPage,
    pageSize,
    totalItems,
    
    // Actions
    setFilters,
    updateFilter,
    clearFilters,
    setSearchQuery,
    setSearchDebouncedQuery,
    toggleQuickFilters,
    addFavoriteFilter,
    removeFavoriteFilter,
    setCurrentPage,
    setPageSize: updatePageSize,
    setTotalItems,
    resetPagination
  };
}

/**
 * Hook for managing quote editor state
 */
export function useQuoteEditor() {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<'create' | 'edit' | 'duplicate'>('create');
  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const openEditor = useCallback((quote?: Quote, editorMode: 'create' | 'edit' | 'duplicate' = 'create') => {
    setMode(editorMode);
    setEditingQuote(quote || null);
    setIsOpen(true);
    setIsDirty(false);
    setErrors({});
  }, []);
  
  const closeEditor = useCallback(() => {
    setIsOpen(false);
    setEditingQuote(null);
    setIsDirty(false);
    setErrors({});
    setIsSaving(false);
  }, []);
  
  const markDirty = useCallback(() => {
    setIsDirty(true);
  }, []);
  
  const setSavingState = useCallback((saving: boolean) => {
    setIsSaving(saving);
  }, []);
  
  const setValidationErrors = useCallback((validationErrors: Record<string, string>) => {
    setErrors(validationErrors);
  }, []);
  
  const clearError = useCallback((field: string) => {
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
  }, []);
  
  const clearAllErrors = useCallback(() => {
    setErrors({});
  }, []);
  
  return {
    // State
    isOpen,
    mode,
    editingQuote,
    isDirty,
    isSaving,
    errors,
    
    // Actions
    openEditor,
    closeEditor,
    markDirty,
    setSavingState,
    setValidationErrors,
    clearError,
    clearAllErrors
  };
}

/**
 * Hook for combined quote state management
 */
export function useQuoteState() {
  const selection = useQuoteSelection();
  const view = useQuoteView();
  const filters = useQuoteFiltersState();
  const editor = useQuoteEditor();
  
  return {
    selection,
    view,
    filters,
    editor
  };
}

/**
 * Hook for bulk operations state
 */
export function useBulkOperations() {
  const { selectedQuotes, getSelectedCount, deselectAll } = useQuoteSelection();
  
  const canPerformBulkOperation = getSelectedCount() > 0;
  
  const performBulkOperation = async (
    operation: 'updateStatus' | 'archive' | 'delete',
    callback: (quoteIds: string[]) => Promise<void>
  ) => {
    const selectedIds = Array.from(selectedQuotes);
    
    try {
      await callback(selectedIds);
      deselectAll(); // Clear selection after successful operation
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  };
  
  return {
    selectedQuotes,
    selectedCount: getSelectedCount(),
    canPerformBulkOperation,
    performBulkOperation,
    clearSelection: deselectAll
  };
}