'use client';

import { useQuotes } from '@/hooks/quotes/useQuoteOperations';
import { useQuoteSelection, useQuoteView } from '@/hooks/quotes/useQuoteState';
import { QuotesFilter } from '@/services/quotes/QuoteValidation';
import { Quote } from '@/types/quotes/Quote';
import { useCallback, useMemo, useState } from 'react';
import { QuoteCard } from './QuoteCard';
import { QuoteDetailModal } from './QuoteDetailModal';
import { QuoteTable } from './QuoteTable';

interface QuoteListProps {
  filters: QuotesFilter;
  searchQuery?: string;
  className?: string;
}

/**
 * Main quote list component that renders quotes in different view modes
 */
export function QuoteList({ 
  filters, 
  searchQuery = '', 
  className = '' 
}: QuoteListProps) {
  const { viewMode, listDensity, gridSize } = useQuoteView();
  const { 
    selectedQuotes, 
    selectQuote, 
    deselectQuote, 
    toggleQuote, 
    selectAll, 
    deselectAll,
    selectRange 
  } = useQuoteSelection();

  // Modal state for viewing quote details
  const [selectedQuoteForView, setSelectedQuoteForView] = useState<Quote | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  
  // Fetch quotes with current filters
  const { 
    data: quotesResponse, 
    isLoading, 
    isError, 
    error, 
    refetch 
  } = useQuotes(filters);
  
  const quotes = quotesResponse?.quotes || [];
  
  // Filter quotes based on search query
  const filteredQuotes = useMemo(() => {
    if (!searchQuery.trim()) return quotes;
    
    const query = searchQuery.toLowerCase();
    return quotes.filter((quote: Quote) => 
      quote.quoteNumber.toLowerCase().includes(query) ||
      quote.customerName.toLowerCase().includes(query) ||
      quote.status.toLowerCase().includes(query)
    );
  }, [quotes, searchQuery]);
  
  // Handle quote selection
  const handleQuoteSelect = useCallback((quote: Quote, event?: React.MouseEvent) => {
    if (!event) {
      toggleQuote(quote.id);
      return;
    }
    
    if (event.shiftKey && selectedQuotes.size > 0) {
      // Range selection
      const quoteIds = filteredQuotes.map(q => q.id);
      const lastSelectedId = Array.from(selectedQuotes)[selectedQuotes.size - 1];
      selectRange(lastSelectedId, quote.id, quoteIds);
    } else if (event.ctrlKey || event.metaKey) {
      // Multi-selection
      toggleQuote(quote.id);
    } else {
      // Single selection
      deselectAll();
      selectQuote(quote.id);
    }
  }, [selectedQuotes, filteredQuotes, selectQuote, deselectQuote, toggleQuote, selectAll, deselectAll, selectRange]);
  
  // Handle select all
  const handleSelectAll = useCallback(() => {
    const allIds = filteredQuotes.map(q => q.id);
    selectAll(allIds);
  }, [filteredQuotes, selectAll]);

  // Handle view quote modal
  const handleViewQuote = useCallback((quote: Quote) => {
    setSelectedQuoteForView(quote);
    setIsModalOpen(true);
    setModalError(null);
    // In a real app, you might fetch additional quote details here
    // For now, we'll use the quote data we already have
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedQuoteForView(null);
    setModalError(null);
  }, []);

  const handlePrintQuote = useCallback((quote: Quote) => {
    // Placeholder for print functionality
    console.log('Print quote:', quote.quoteNumber);
    // In a real app, this would generate and print a PDF
  }, []);

  const handleEmailQuote = useCallback((quote: Quote) => {
    // Placeholder for email functionality  
    console.log('Email quote:', quote.quoteNumber);
    // In a real app, this would open email composer or send directly
  }, []);
  
  // Loading state
  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading quotes...</span>
      </div>
    );
  }
  
  // Error state
  if (isError) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">
              Error loading quotes
            </h3>
            <div className="mt-2 text-sm text-red-700">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </div>
            <div className="mt-4">
              <button
                onClick={() => refetch()}
                className="text-sm bg-red-100 text-red-800 px-3 py-1 rounded-md hover:bg-red-200 transition-colors"
              >
                Try again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  // Empty state
  if (filteredQuotes.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {searchQuery ? 'No quotes found' : 'No quotes yet'}
        </h3>
        <p className="text-gray-600 mb-6 max-w-md mx-auto">
          {searchQuery 
            ? `No quotes match "${searchQuery}". Try adjusting your search terms or filters.`
            : 'Get started by creating your first quote.'
          }
        </p>
        {!searchQuery && (
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Create Quote
          </button>
        )}
      </div>
    );
  }
  
  // Render quotes in selected view mode
  const commonProps = {
    quotes: filteredQuotes,
    selectedQuotes,
    onQuoteSelect: handleQuoteSelect,
    onSelectAll: handleSelectAll,
    onDeselectAll: deselectAll,
    onViewQuote: handleViewQuote
  };
  
  if (viewMode === 'table') {
    return (
      <>
        <div className={className}>
          <QuoteTable {...commonProps} />
        </div>
        {selectedQuoteForView && (
          <QuoteDetailModal
            quote={selectedQuoteForView}
            open={isModalOpen}
            onClose={handleCloseModal}
            onPrint={handlePrintQuote}
            onEmail={handleEmailQuote}
            loading={modalLoading}
            error={modalError || undefined}
          />
        )}
      </>
    );
  }
  
  if (viewMode === 'grid') {
    return (
      <>
        <div className={`${className} grid gap-4 ${
          gridSize === 'small' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' :
          gridSize === 'medium' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' :
          'grid-cols-1 sm:grid-cols-2'
        }`}>
          {filteredQuotes.map((quote) => (
            <QuoteCard
              key={quote.id}
              quote={quote}
              isSelected={selectedQuotes.has(quote.id)}
              onSelect={(event: React.MouseEvent) => handleQuoteSelect(quote, event)}
              size={gridSize}
            />
          ))}
        </div>
        {selectedQuoteForView && (
          <QuoteDetailModal
            quote={selectedQuoteForView}
            open={isModalOpen}
            onClose={handleCloseModal}
            onPrint={handlePrintQuote}
            onEmail={handleEmailQuote}
            loading={modalLoading}
            error={modalError || undefined}
          />
        )}
      </>
    );
  }
  
  // List view
  return (
    <>
      <div className={`${className} space-y-${listDensity === 'compact' ? '1' : listDensity === 'comfortable' ? '2' : '3'}`}>
        {filteredQuotes.map((quote) => (
          <QuoteCard
            key={quote.id}
            quote={quote}
            isSelected={selectedQuotes.has(quote.id)}
            onSelect={(event: React.MouseEvent) => handleQuoteSelect(quote, event)}
            layout="list"
            density={listDensity}
          />
        ))}
      </div>
      {selectedQuoteForView && (
        <QuoteDetailModal
          quote={selectedQuoteForView}
          open={isModalOpen}
          onClose={handleCloseModal}
          onPrint={handlePrintQuote}
          onEmail={handleEmailQuote}
          loading={modalLoading}
          error={modalError || undefined}
        />
      )}
    </>
  );

}