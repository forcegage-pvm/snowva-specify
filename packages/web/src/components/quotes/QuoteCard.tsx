'use client';

import { formatCurrency, formatDate } from '@/lib/utils/format';
import { getStatusColor, getStatusLabel } from '@/lib/utils/quote-status';
import { Quote } from '@/types/quotes/Quote';
import { memo, useCallback } from 'react';

interface QuoteCardProps {
  quote: Quote;
  isSelected?: boolean;
  onSelect?: (event?: React.MouseEvent) => void;
  layout?: 'grid' | 'list';
  size?: 'small' | 'medium' | 'large';
  density?: 'compact' | 'comfortable' | 'spacious';
  showActions?: boolean;
  className?: string;
}

/**
 * Quote card component for displaying quotes in grid or list layouts
 */
export const QuoteCard = memo<QuoteCardProps>(function QuoteCard({
  quote,
  isSelected = false,
  onSelect,
  layout = 'grid',
  size = 'medium',
  density = 'comfortable',
  showActions = true,
  className = ''
}) {
  const handleClick = useCallback((event: React.MouseEvent) => {
    if (onSelect) {
      onSelect(event);
    }
  }, [onSelect]);
  
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (onSelect) {
        onSelect();
      }
    }
  }, [onSelect]);
  
  // Get status styling
  const statusColor = getStatusColor(quote.status);
  const statusLabel = getStatusLabel(quote.status);
  
  // Calculate spacing based on density
  const spacing = {
    compact: 'p-3 space-y-1',
    comfortable: 'p-4 space-y-2', 
    spacious: 'p-6 space-y-3'
  }[density];
  
  // Layout-specific classes
  const layoutClasses = layout === 'list' 
    ? 'flex items-center justify-between'
    : 'block';
  
  // Size-specific classes for grid layout
  const sizeClasses = layout === 'grid' 
    ? {
        small: 'min-h-[120px]',
        medium: 'min-h-[160px]',
        large: 'min-h-[200px]'
      }[size]
    : '';
  
  return (
    <div
      className={`
        relative bg-white border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer
        ${isSelected ? 'ring-2 ring-blue-500 border-blue-200' : 'border-gray-200 hover:border-gray-300'}
        ${spacing}
        ${layoutClasses}
        ${sizeClasses}
        ${className}
      `}
      onClick={handleClick}
      onKeyPress={handleKeyPress}
      tabIndex={0}
      role="button"
      aria-pressed={isSelected}
      aria-label={`Quote ${quote.quoteNumber} for ${quote.customerName}`}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute top-2 right-2 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      )}
      
      {layout === 'list' ? (
        // List layout
        <div className="flex items-center justify-between flex-1">
          <div className="flex items-center space-x-4 flex-1 min-w-0">
            {/* Quote number and customer */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {quote.quoteNumber}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
                  {statusLabel}
                </span>
              </div>
              <p className="text-sm text-gray-600 truncate mt-1">
                {quote.customerName}
              </p>
            </div>
            
            {/* Amount */}
            <div className="text-right">
              <div className="text-sm font-medium text-gray-900">
                {formatCurrency(quote.totalAmount)}
              </div>
            </div>
            
            {/* Dates */}
            <div className="text-right text-xs text-gray-500 space-y-1">
              <div>Created {formatDate(quote.createdAt, 'short')}</div>
              {quote.expiryDate && (
                <div>Expires {formatDate(quote.expiryDate, 'short')}</div>
              )}
            </div>
          </div>
          
          {showActions && (
            <div className="flex items-center space-x-2 ml-4">
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle view action
                }}
                title="View quote"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit action
                }}
                title="Edit quote"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      ) : (
        // Grid layout
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {quote.quoteNumber}
              </h3>
              <p className="text-sm text-gray-600 truncate mt-1">
                {quote.customerName}
              </p>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusColor}`}>
              {statusLabel}
            </span>
          </div>
          
          {/* Amount */}
          <div>
            <div className="text-lg font-semibold text-gray-900">
              {formatCurrency(quote.totalAmount)}
            </div>
          </div>
          
          {/* Dates */}
          <div className="text-xs text-gray-500 space-y-1">
            <div>Created {formatDate(quote.createdAt, 'short')}</div>
            {quote.expiryDate && (
              <div>Expires {formatDate(quote.expiryDate, 'short')}</div>
            )}
            <div>Updated {formatDate(quote.updatedAt, 'short')}</div>
          </div>
          
          {/* Actions */}
          {showActions && (
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-gray-100">
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle view action
                }}
                title="View quote"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </button>
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle edit action
                }}
                title="Edit quote"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                className="text-gray-400 hover:text-gray-600 p-1 rounded"
                onClick={(e) => {
                  e.stopPropagation();
                  // Handle more actions
                }}
                title="More actions"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
});