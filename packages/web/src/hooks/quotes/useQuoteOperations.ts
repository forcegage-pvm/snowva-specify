'use client';

import { QuoteServiceFactory } from '@/services/quotes/QuoteService';
import type {
    BulkActionRequest,
    CreateQuoteRequest,
    QuotesFilter,
    StatusUpdateRequest,
    UpdateQuoteRequest
} from '@/services/quotes/QuoteValidation';
import type { Quote } from '@/types/quotes/Quote';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';

/**
 * Query keys for TanStack Query
 */
export const QUOTE_QUERY_KEYS = {
  all: ['quotes'] as const,
  lists: () => [...QUOTE_QUERY_KEYS.all, 'list'] as const,
  list: (filters: Partial<QuotesFilter>) => [...QUOTE_QUERY_KEYS.lists(), filters] as const,
  details: () => [...QUOTE_QUERY_KEYS.all, 'detail'] as const,
  detail: (id: string) => [...QUOTE_QUERY_KEYS.details(), id] as const,
  history: (id: string) => [...QUOTE_QUERY_KEYS.all, 'history', id] as const,
  stats: (filters?: Partial<QuotesFilter>) => [...QUOTE_QUERY_KEYS.all, 'stats', filters] as const
};

/**
 * Hook for fetching quotes list with filtering and pagination
 */
export function useQuotes(filters: Partial<QuotesFilter> = {}) {
  const service = QuoteServiceFactory.getInstance();
  
  // Merge with default filters
  const fullFilters: QuotesFilter = {
    page: 1,
    pageSize: 25,
    sort: 'createdAt',
    sortOrder: 'desc',
    includeArchived: false,
    ...filters
  };
  
  return useQuery({
    queryKey: QUOTE_QUERY_KEYS.list(fullFilters),
    queryFn: () => service.getQuotes(fullFilters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
    retry: 2
  });
}

/**
 * Hook for fetching a single quote
 */
export function useQuote(
  id: string,
  options?: Omit<UseQueryOptions<Quote | null>, 'queryKey' | 'queryFn'>
) {
  const service = QuoteServiceFactory.getInstance();
  
  return useQuery({
    queryKey: QUOTE_QUERY_KEYS.detail(id),
    queryFn: () => service.getQuoteById(id),
    enabled: !!id,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    ...options
  });
}

/**
 * Hook for creating quotes
 */
export function useCreateQuote() {
  const queryClient = useQueryClient();
  const service = QuoteServiceFactory.getInstance();
  
  return useMutation({
    mutationFn: (request: CreateQuoteRequest) => service.createQuote(request),
    onSuccess: (newQuote) => {
      // Update queries
      queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.lists() });
      
      // Optimistically add to cache
      queryClient.setQueryData(QUOTE_QUERY_KEYS.detail(newQuote.id), newQuote);
    },
    onError: (error) => {
      console.error('Failed to create quote:', error);
    }
  });
}

/**
 * Hook for updating quotes
 */
export function useUpdateQuote() {
  const queryClient = useQueryClient();
  const service = QuoteServiceFactory.getInstance();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdateQuoteRequest }) => 
      service.updateQuote(id, request),
    onSuccess: (updatedQuote) => {
      // Update specific quote cache
      queryClient.setQueryData(QUOTE_QUERY_KEYS.detail(updatedQuote.id), updatedQuote);
      
      // Invalidate lists to refresh totals/counts
      queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to update quote:', error);
    }
  });
}

/**
 * Hook for updating quote status
 */
export function useUpdateQuoteStatus() {
  const queryClient = useQueryClient();
  const service = QuoteServiceFactory.getInstance();
  
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: StatusUpdateRequest }) => 
      service.updateQuoteStatus(id, request),
    onSuccess: (updatedQuote) => {
      // Update specific quote cache
      queryClient.setQueryData(QUOTE_QUERY_KEYS.detail(updatedQuote.id), updatedQuote);
      
      // Invalidate lists and stats
      queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.all, exact: false });
    },
    onError: (error) => {
      console.error('Failed to update quote status:', error);
    }
  });
}

/**
 * Hook for deleting quotes
 */
export function useDeleteQuote() {
  const queryClient = useQueryClient();
  const service = QuoteServiceFactory.getInstance();
  
  return useMutation({
    mutationFn: (id: string) => service.deleteQuote(id),
    onSuccess: (_, deletedId) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: QUOTE_QUERY_KEYS.detail(deletedId) });
      
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.lists() });
    },
    onError: (error) => {
      console.error('Failed to delete quote:', error);
    }
  });
}

/**
 * Hook for bulk actions on quotes
 */
export function useBulkQuoteAction() {
  const queryClient = useQueryClient();
  const service = QuoteServiceFactory.getInstance();
  
  return useMutation({
    mutationFn: (request: BulkActionRequest) => service.bulkAction(request),
    onSuccess: () => {
      // Invalidate all quote-related queries
      queryClient.invalidateQueries({ queryKey: QUOTE_QUERY_KEYS.all });
    },
    onError: (error) => {
      console.error('Failed to perform bulk action:', error);
    }
  });
}

/**
 * Hook for quote status history
 */
export function useQuoteHistory(id: string) {
  const service = QuoteServiceFactory.getInstance();
  
  return useQuery({
    queryKey: QUOTE_QUERY_KEYS.history(id),
    queryFn: () => service.getStatusHistory(id),
    enabled: !!id,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 2 * 60 * 1000 // 2 minutes
  });
}

/**
 * Hook for optimistic quote updates with rollback
 */
export function useOptimisticQuoteUpdate() {
  const queryClient = useQueryClient();
  const updateMutation = useUpdateQuote();
  
  const updateOptimistically = useCallback(
    async (id: string, updates: Partial<Quote>, request: UpdateQuoteRequest) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: QUOTE_QUERY_KEYS.detail(id) });
      
      // Snapshot previous value
      const previousQuote = queryClient.getQueryData<Quote>(QUOTE_QUERY_KEYS.detail(id));
      
      // Optimistically update
      if (previousQuote) {
        const optimisticQuote: Quote = {
          ...previousQuote,
          ...updates,
          updatedAt: new Date(),
          version: previousQuote.version + 1
        };
        
        queryClient.setQueryData(QUOTE_QUERY_KEYS.detail(id), optimisticQuote);
      }
      
      // Perform actual update
      try {
        await updateMutation.mutateAsync({ id, request });
      } catch (error) {
        // Rollback on error
        if (previousQuote) {
          queryClient.setQueryData(QUOTE_QUERY_KEYS.detail(id), previousQuote);
        }
        throw error;
      }
    },
    [queryClient, updateMutation]
  );
  
  return {
    updateOptimistically,
    isLoading: updateMutation.isPending,
    error: updateMutation.error
  };
}

/**
 * Hook for quote validation
 */
export function useQuoteValidation() {
  const service = QuoteServiceFactory.getInstance();
  const [validationResults, setValidationResults] = useState<{
    [quoteId: string]: { valid: boolean; errors: string[] };
  }>({});
  
  const validateQuote = useCallback(
    async (quote: Partial<Quote>) => {
      if (!quote.id) return { valid: false, errors: ['Quote ID is required'] };
      
      try {
        const result = await service.validateQuote(quote);
        setValidationResults(prev => ({
          ...prev,
          [quote.id!]: result
        }));
        return result;
      } catch (error) {
        const errorResult = { valid: false, errors: ['Validation failed'] };
        setValidationResults(prev => ({
          ...prev,
          [quote.id!]: errorResult
        }));
        return errorResult;
      }
    },
    [service]
  );
  
  const clearValidation = useCallback((quoteId: string) => {
    setValidationResults(prev => {
      const newResults = { ...prev };
      delete newResults[quoteId];
      return newResults;
    });
  }, []);
  
  return {
    validateQuote,
    clearValidation,
    validationResults,
    getValidationResult: (quoteId: string) => validationResults[quoteId]
  };
}

/**
 * Hook for managing quote filters with persistence
 */
export function useQuoteFilters(initialFilters: Partial<QuotesFilter> = {}) {
  const [filters, setFilters] = useState<Partial<QuotesFilter>>(initialFilters);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Persist filters to localStorage
  useEffect(() => {
    const saved = localStorage.getItem('quoteFilters');
    if (saved) {
      try {
        const parsedFilters = JSON.parse(saved);
        setFilters(prev => ({ ...prev, ...parsedFilters }));
      } catch (error) {
        console.warn('Failed to parse saved quote filters');
      }
    }
  }, []);
  
  const updateFilters = useCallback((newFilters: Partial<QuotesFilter>) => {
    setIsFiltering(true);
    setFilters(prev => {
      const updated = { ...prev, ...newFilters };
      
      // Save to localStorage
      try {
        localStorage.setItem('quoteFilters', JSON.stringify(updated));
      } catch (error) {
        console.warn('Failed to save quote filters');
      }
      
      return updated;
    });
    
    // Reset filtering state after a short delay
    setTimeout(() => setIsFiltering(false), 500);
  }, []);
  
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
    localStorage.removeItem('quoteFilters');
  }, [initialFilters]);
  
  const resetToDefaults = useCallback(() => {
    const defaults: Partial<QuotesFilter> = {
      page: 1,
      pageSize: 25,
      sort: 'createdAt',
      sortOrder: 'desc',
      includeArchived: false
    };
    updateFilters(defaults);
  }, [updateFilters]);
  
  return {
    filters,
    updateFilters,
    clearFilters,
    resetToDefaults,
    isFiltering
  };
}

/**
 * Hook for auto-saving quote drafts
 */
export function useQuoteAutosave(quote: Partial<Quote>, enabled: boolean = true) {
  const updateMutation = useUpdateQuote();
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Auto-save effect
  useEffect(() => {
    if (!enabled || !quote.id) return;
    
    const timer = setTimeout(async () => {
      if (hasUnsavedChanges) {
        try {
          await updateMutation.mutateAsync({
            id: quote.id!,
            request: quote as UpdateQuoteRequest
          });
          setLastSaved(new Date());
          setHasUnsavedChanges(false);
        } catch (error) {
          console.error('Auto-save failed:', error);
        }
      }
    }, 2000); // Auto-save after 2 seconds of inactivity
    
    return () => clearTimeout(timer);
  }, [quote, enabled, hasUnsavedChanges, updateMutation]);
  
  // Track changes
  useEffect(() => {
    if (enabled) {
      setHasUnsavedChanges(true);
    }
  }, [quote, enabled]);
  
  const manualSave = useCallback(async () => {
    if (!quote.id) return false;
    
    try {
      await updateMutation.mutateAsync({
        id: quote.id,
        request: quote as UpdateQuoteRequest
      });
      setLastSaved(new Date());
      setHasUnsavedChanges(false);
      return true;
    } catch (error) {
      console.error('Manual save failed:', error);
      return false;
    }
  }, [quote, updateMutation]);
  
  return {
    lastSaved,
    hasUnsavedChanges,
    isAutoSaving: updateMutation.isPending,
    manualSave,
    autoSaveError: updateMutation.error
  };
}

/**
 * Hook for quote keyboard shortcuts
 */
export function useQuoteKeyboardShortcuts(
  quote: Quote | null,
  callbacks: {
    onSave?: () => void;
    onDuplicate?: () => void;
    onDelete?: () => void;
    onStatusChange?: (status: QuoteStatus) => void;
    onEscape?: () => void;
  }
) {
  useEffect(() => {
    const handleKeydown = (event: KeyboardEvent) => {
      // Check for modifier keys
      const isCtrlOrCmd = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;
      
      // Ignore if typing in input/textarea
      const target = event.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
        return;
      }
      
      switch (event.key) {
        case 's':
          if (isCtrlOrCmd) {
            event.preventDefault();
            callbacks.onSave?.();
          }
          break;
          
        case 'd':
          if (isCtrlOrCmd && isShift) {
            event.preventDefault();
            callbacks.onDuplicate?.();
          }
          break;
          
        case 'Delete':
          if (isCtrlOrCmd) {
            event.preventDefault();
            callbacks.onDelete?.();
          }
          break;
          
        case 'Escape':
          callbacks.onEscape?.();
          break;
          
        // Status shortcuts
        case '1':
          if (isCtrlOrCmd) {
            event.preventDefault();
            callbacks.onStatusChange?.(QuoteStatus.Draft);
          }
          break;
          
        case '2':
          if (isCtrlOrCmd) {
            event.preventDefault();
            callbacks.onStatusChange?.(QuoteStatus.Pending);
          }
          break;
          
        case '3':
          if (isCtrlOrCmd) {
            event.preventDefault();
            callbacks.onStatusChange?.(QuoteStatus.Approved);
          }
          break;
      }
    };
    
    window.addEventListener('keydown', handleKeydown);
    return () => window.removeEventListener('keydown', handleKeydown);
  }, [callbacks, quote]);
}

// All hooks are already exported above