'use client';

import { useQuoteFiltersState } from '@/hooks/quotes/useQuoteState';
import { getStatusLabel } from '@/lib/utils/quote-status';
import { QuotesFilter } from '@/services/quotes/QuoteValidation';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { useCallback, useEffect, useMemo, useState } from 'react';

interface QuoteFiltersProps {
  onFiltersChange?: (filters: QuotesFilter) => void;
  className?: string;
}

/**
 * Comprehensive filters component for quotes listing
 */
export function QuoteFilters({ 
  onFiltersChange, 
  className = '' 
}: QuoteFiltersProps) {
  const {
    activeFilters,
    searchQuery,
    showQuickFilters,
    favoriteFilters,
    setFilters,
    updateFilter,
    clearFilters,
    setSearchQuery,
    toggleQuickFilters,
    addFavoriteFilter,
    removeFavoriteFilter
  } = useQuoteFiltersState();
  
  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  // Sync localSearchQuery with searchQuery from hook
  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);
  
  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(localSearchQuery);
    }, 300);
    
    return () => clearTimeout(timer);
  }, [localSearchQuery, setSearchQuery]);
  
  // Notify parent of filter changes
  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(activeFilters);
    }
  }, [activeFilters, onFiltersChange]);
  
  // Status filter options
  const statusOptions = useMemo(() => [
    { value: QuoteStatus.Draft, label: getStatusLabel(QuoteStatus.Draft) },
    { value: QuoteStatus.Pending, label: getStatusLabel(QuoteStatus.Pending) },
    { value: QuoteStatus.Approved, label: getStatusLabel(QuoteStatus.Approved) },
    { value: QuoteStatus.Rejected, label: getStatusLabel(QuoteStatus.Rejected) },
    { value: QuoteStatus.Converted, label: getStatusLabel(QuoteStatus.Converted) },
    { value: QuoteStatus.Archived, label: getStatusLabel(QuoteStatus.Archived) }
  ], []);
  
  // Quick filter presets
  const quickFilters = useMemo(() => [
    {
      name: 'Active Quotes',
      filters: { 
        statuses: [QuoteStatus.Draft, QuoteStatus.Pending],
        includeArchived: false
      }
    },
    {
      name: 'Needs Attention',
      filters: { 
        statuses: [QuoteStatus.Pending],
        includeArchived: false
      }
    },
    {
      name: 'Recent',
      filters: { 
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        includeArchived: false
      }
    },
    {
      name: 'This Month',
      filters: { 
        dateFrom: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        includeArchived: false
      }
    }
  ], []);
  
  const handleStatusToggle = useCallback((status: QuoteStatus) => {
    const currentStatuses = activeFilters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter((s: QuoteStatus) => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('status', newStatuses.length > 0 ? newStatuses : undefined);
  }, [activeFilters.status, updateFilter]);
  
  const handleDateRangeChange = useCallback((field: 'dateFrom' | 'dateTo', value: string) => {
    updateFilter(field, value || undefined);
  }, [updateFilter]);
  
  // Note: Amount range filtering would need to be handled at the service layer
  // since it's not part of the current QuotesFilter schema
  
  const handleQuickFilter = useCallback((quickFilter: typeof quickFilters[0]) => {
    setFilters(quickFilter.filters);
  }, [setFilters]);
  
  const handleSaveFavorite = useCallback(() => {
    const name = prompt('Enter a name for this filter preset:');
    if (name && name.trim()) {
      addFavoriteFilter(activeFilters);
    }
  }, [activeFilters, addFavoriteFilter]);
  
  const hasActiveFilters = useMemo(() => {
    // Check if there are filters beyond the default ones
    const defaultFilters = {
      page: 1,
      pageSize: 25,
      sort: 'createdAt',
      sortOrder: 'desc',
      includeArchived: false
    };
    
    return Object.keys(activeFilters).some(key => {
      const value = activeFilters[key as keyof QuotesFilter];
      const defaultValue = defaultFilters[key as keyof typeof defaultFilters];
      
      // Skip empty values
      if (value === undefined || value === '' || (Array.isArray(value) && value.length === 0)) {
        return false;
      }
      
      // Check if this filter is different from default
      return value !== defaultValue;
    }) || searchQuery.trim().length > 0;
  }, [activeFilters, searchQuery]);
  
  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      {/* Main filter bar */}
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Search */}
          <div className="flex-1 max-w-md">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search quotes..."
                value={localSearchQuery}
                onChange={(e) => setLocalSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
              {localSearchQuery && (
                <button
                  onClick={() => {
                    setLocalSearchQuery('');
                    setSearchQuery('');
                  }}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label="Clear search"
                  title="Clear search"
                >
                  <svg className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
          
          {/* Filter actions */}
          <div className="flex items-center space-x-2">
            {/* Quick filters toggle */}
            <button
              onClick={toggleQuickFilters}
              className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
                showQuickFilters
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Quick Filters
            </button>
            
            {/* Advanced filters toggle */}
            <button
              onClick={() => setShowAdvancedFilters(prev => !prev)}
              className={`px-3 py-2 text-sm font-medium border rounded-md transition-colors ${
                showAdvancedFilters
                  ? 'bg-blue-50 text-blue-700 border-blue-300'
                  : 'text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4 mr-1 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.707V4z" />
              </svg>
              Advanced
            </button>
            
            {/* Clear filters */}
            {hasActiveFilters && (
              <button
                onClick={() => {
                  clearFilters();
                  setLocalSearchQuery('');
                }}
                className="px-3 py-2 text-sm font-medium text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Clear
              </button>
            )}
            
            {/* Save filters */}
            {hasActiveFilters && (
              <button
                onClick={handleSaveFavorite}
                className="px-3 py-2 text-sm font-medium text-blue-700 border border-blue-300 rounded-md hover:bg-blue-50 transition-colors"
              >
                Save
              </button>
            )}
          </div>
        </div>
        
        {/* Active filter chips */}
        {hasActiveFilters && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.status && activeFilters.status.length > 0 && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {activeFilters.status.map((s: QuoteStatus) => getStatusLabel(s)).join(', ')}
                <button
                  onClick={() => updateFilter('status', undefined)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </div>
            )}
            
            {activeFilters.dateFrom && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                From: {activeFilters.dateFrom}
                <button
                  onClick={() => updateFilter('dateFrom', undefined)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            )}
            
            {activeFilters.dateTo && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                To: {activeFilters.dateTo}
                <button
                  onClick={() => updateFilter('dateTo', undefined)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </div>
            )}
            
            {activeFilters.includeArchived && (
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Include Archived
                <button
                  onClick={() => updateFilter('includeArchived', false)}
                  className="ml-2 text-gray-600 hover:text-gray-800"
                >
                  ×
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Quick filters */}
      {showQuickFilters && (
        <div className="px-6 py-3 bg-gray-50 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium text-gray-700 mr-2">Quick Filters:</span>
              {quickFilters.map((filter, index) => (
                <button
                  key={index}
                  onClick={() => handleQuickFilter(filter)}
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors"
                >
                  {filter.name}
                </button>
              ))}
            </div>
            
            {favoriteFilters.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <span className="text-sm font-medium text-gray-700 mr-2">Saved:</span>
                {favoriteFilters.map((filter, index) => (
                  <div key={index} className="flex items-center">
                    <button
                      onClick={() => setFilters(filter)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-l-md hover:bg-blue-200 transition-colors"
                    >
                      Filter {index + 1}
                    </button>
                    <button
                      onClick={() => removeFavoriteFilter(index)}
                      className="px-1 py-1 text-sm bg-blue-100 text-blue-700 rounded-r-md border-l border-blue-200 hover:bg-blue-200 transition-colors"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
      
      {/* Advanced filters */}
      {showAdvancedFilters && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Status filters */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <div className="space-y-2">
                {statusOptions.map((status) => (
                  <label key={status.value} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={activeFilters.status?.includes(status.value) || false}
                      onChange={() => handleStatusToggle(status.value)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">{status.label}</span>
                  </label>
                ))}
              </div>
            </div>
            
            {/* Date range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="space-y-2">
                <input
                  type="date"
                  value={activeFilters.dateFrom || ''}
                  onChange={(e) => handleDateRangeChange('dateFrom', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="From date"
                />
                <input
                  type="date"
                  value={activeFilters.dateTo || ''}
                  onChange={(e) => handleDateRangeChange('dateTo', e.target.value)}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="To date"
                />
              </div>
            </div>
            
            {/* Customer search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Customer ID</label>
              <input
                type="text"
                value={activeFilters.customerId || ''}
                onChange={(e) => updateFilter('customerId', e.target.value || undefined)}
                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Customer ID"
              />
            </div>
          </div>
          
          {/* Additional options */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={activeFilters.includeArchived || false}
                  onChange={(e) => updateFilter('includeArchived', e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Include archived quotes</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}