// packages/web/src/app/(dashboard)/quotes/page.tsx
'use client';

import Breadcrumbs from '@/components/layout/Breadcrumbs';
import { QuoteFilters } from '@/components/quotes/QuoteFilters';
import { QuoteList } from '@/components/quotes/QuoteList';
import QuotesErrorBoundary from '@/components/quotes/QuotesErrorBoundary';
import { Button } from '@/components/ui/button';
import { useQuotes } from '@/hooks/quotes/useQuoteOperations';
import { useQuoteFiltersState, useQuoteSelection } from '@/hooks/quotes/useQuoteState';
import { Plus, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

// Loading components
function QuoteListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-gray-200 rounded animate-pulse" />
        <div className="h-10 w-32 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    </div>
  );
}

function QuoteDetailsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-8 w-64 bg-gray-200 rounded animate-pulse" />
      <div className="space-y-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    </div>
  );
}

export default function QuotesPage() {
  const router = useRouter();
  const { selectedQuotes, deselectAll, getSelectedCount } = useQuoteSelection();
  const filterState = useQuoteFiltersState();
  const { activeFilters, setFilters, clearFilters: clearAllFilters } = filterState;
  const { data: quotesData, isLoading, error, refetch } = useQuotes(activeFilters);
  
  // Client-side timestamp to avoid hydration mismatch
  const [lastUpdated, setLastUpdated] = useState<string>('');
  
  useEffect(() => {
    setLastUpdated(new Date().toLocaleTimeString());
  }, [quotesData]);


  const selectedQuoteIds = Array.from(selectedQuotes);
  const selectedQuote = selectedQuoteIds.length === 1 ? quotesData?.quotes.find(q => q.id === selectedQuoteIds[0]) : null;

  const handleRefresh = () => {
    refetch();
  };

  const handleCreateQuote = () => {
    // Navigate to quote composer using Next.js router
    router.push('/sales/quote-composer');
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-96 space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900">Error Loading Quotes</h3>
          <p className="text-sm text-gray-600 mt-1">
            {error instanceof Error ? error.message : 'Failed to load quotes'}
          </p>
        </div>
        <Button onClick={handleRefresh} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Try Again
        </Button>
      </div>
    );
  }

  return (
    <QuotesErrorBoundary>
      {/* Breadcrumbs */}
      <div className="mb-6">
        <Breadcrumbs 
          items={[
            { label: 'Quotes', current: true }
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Quotes</h1>
          <p className="text-sm text-gray-600 mt-1">
            Manage your sales quotes and proposals
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={handleRefresh} variant="outline" disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={handleCreateQuote}>
            <Plus className="h-4 w-4 mr-2" />
            New Quote
          </Button>
        </div>
      </div>

      {/* Filters Section - Above the table */}
      <div className="bg-gray-50 rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Filters</h3>
        <Suspense fallback={<div className="h-20 bg-gray-100 rounded animate-pulse" />}>
          <QuoteFilters
            onFiltersChange={setFilters}
          />
        </Suspense>
      </div>

      {/* Main Content - Table */}
      <div className="flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" style={{ height: 'calc(100vh - 20rem)' }}>
        <div className="flex flex-1 min-h-0">
          {/* Quotes List - Full Width */}
          <div className="flex-1 flex min-w-0">
            <div className="flex-1 p-6 overflow-hidden">
              <Suspense fallback={<QuoteListSkeleton />}>
                <QuoteList
                  filters={activeFilters}
                  searchQuery=""
                />
              </Suspense>
            </div>

            {/* Quote Details Panel */}
            {getSelectedCount() > 0 && (
              <div className="flex-shrink-0 w-96 border-l border-gray-200 bg-white">
                <div className="p-4 border-b border-gray-200">
                  <button
                    onClick={() => deselectAll()}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    ← Close Details
                  </button>
                </div>
                <div className="p-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {getSelectedCount()} Quote{getSelectedCount() > 1 ? 's' : ''} Selected
                  </h3>
                  <p className="text-sm text-gray-600">
                    Select a single quote to view detailed information.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status Bar */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4 text-sm text-gray-600">
            <span>
              {isLoading ? 'Loading...' : `${quotesData?.totalCount || 0} quotes`}
            </span>
            {getSelectedCount() > 0 && (
              <span>
                {getSelectedCount()} selected
              </span>
            )}
          </div>
          <div className="text-xs text-gray-500">
            {lastUpdated ? `Last updated: ${lastUpdated}` : 'Loading...'}
          </div>
        </div>
      </div>
    </QuotesErrorBoundary>
  );
}
