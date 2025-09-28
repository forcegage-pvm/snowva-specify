'use client';

import { QuoteActionsMenu } from '@/components/quotes/QuoteActionsMenu';
import { QuoteStatusBadge } from '@/components/quotes/QuoteStatusBadge';
import { useQuoteView } from '@/hooks/quotes/useQuoteState';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Quote } from '@/types/quotes/Quote';
import { useCallback, useMemo, useState } from 'react';

interface QuoteTableProps {
  quotes: Quote[];
  selectedQuotes: Set<string>;
  onQuoteSelect: (quote: Quote, event?: React.MouseEvent) => void;
  onSelectAll: () => void;
  onDeselectAll: () => void;
  onViewQuote?: (quote: Quote) => void;
  onEditQuote?: (quote: Quote) => void;
  onDuplicateQuote?: (quote: Quote) => void;
  onConvertQuote?: (quote: Quote) => void;
  onArchiveQuote?: (quote: Quote) => void;
  onStatusChange?: (quote: Quote) => void;
  className?: string;
}

/**
 * Table component for displaying quotes in a data table format
 */
export function QuoteTable({
  quotes,
  selectedQuotes,
  onQuoteSelect,
  onSelectAll,
  onDeselectAll,
  onViewQuote,
  onEditQuote,
  onDuplicateQuote,
  onConvertQuote,
  onArchiveQuote,
  onStatusChange,
  className = ''
}: QuoteTableProps) {
  const {
    visibleColumns,
    columnWidths,
    sortColumn,
    sortDirection,
    setSorting,
    setColumnWidth
  } = useQuoteView();
  
  const [resizingColumn, setResizingColumn] = useState<string | null>(null);
  const [resizeStartX, setResizeStartX] = useState<number>(0);
  const [resizeStartWidth, setResizeStartWidth] = useState<number>(0);
  
  // Check if all visible quotes are selected
  const isAllSelected = quotes.length > 0 && quotes.every(quote => selectedQuotes.has(quote.id));
  const isIndeterminate = selectedQuotes.size > 0 && !isAllSelected;
  
  // Sort quotes based on current sort column and direction
  const sortedQuotes = useMemo(() => {
    if (!sortColumn) return quotes;
    
    return [...quotes].sort((a, b) => {
      const aValue = a[sortColumn as keyof Quote];
      const bValue = b[sortColumn as keyof Quote];
      
      // Handle date fields
      if (sortColumn === 'createdAt' || sortColumn === 'updatedAt' || sortColumn === 'expiryDate') {
        const aTime = new Date(aValue as string).getTime();
        const bTime = new Date(bValue as string).getTime();
        return sortDirection === 'asc' ? aTime - bTime : bTime - aTime;
      }
      
      // Handle numeric fields
      if (sortColumn === 'totalAmount') {
        const aNum = Number(aValue);
        const bNum = Number(bValue);
        return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
      }
      
      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        const aStr = aValue.toLowerCase();
        const bStr = bValue.toLowerCase();
        if (aStr < bStr) return sortDirection === 'asc' ? -1 : 1;
        if (aStr > bStr) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      }
      
      // Default comparison with null checks
      if (aValue != null && bValue != null) {
        if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      }
      // Handle null/undefined values
      if (aValue == null && bValue != null) return sortDirection === 'asc' ? 1 : -1;
      if (aValue != null && bValue == null) return sortDirection === 'asc' ? -1 : 1;
      return 0;
    });
  }, [quotes, sortColumn, sortDirection]);
  
  // Column definitions
  const columns = [
    {
      key: 'quoteNumber',
      label: 'Quote #',
      sortable: true,
      width: columnWidths.quoteNumber || 140
    },
    {
      key: 'customerName',
      label: 'Customer',
      sortable: true,
      width: columnWidths.customerName || 240
    },
    {
      key: 'totalAmount',
      label: 'Amount',
      sortable: true,
      width: columnWidths.totalAmount || 140
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      width: columnWidths.status || 120
    },
    {
      key: 'createdAt',
      label: 'Created',
      sortable: true,
      width: columnWidths.createdAt || 120
    },
    {
      key: 'expiryDate',
      label: 'Expires',
      sortable: true,
      width: columnWidths.expiryDate || 120
    }
  ].filter(col => visibleColumns.includes(col.key));
  
  // Handle column sort
  const handleSort = useCallback((column: string) => {
    if (sortColumn === column) {
      const newDirection = sortDirection === 'asc' ? 'desc' : 'asc';
      setSorting(column, newDirection);
    } else {
      setSorting(column, 'asc');
    }
  }, [sortColumn, sortDirection, setSorting]);
  
  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      onDeselectAll();
    } else {
      onSelectAll();
    }
  }, [isAllSelected, onSelectAll, onDeselectAll]);
  
  // Handle row selection
  const handleRowSelect = useCallback((quote: Quote, event: React.MouseEvent) => {
    onQuoteSelect(quote, event);
  }, [onQuoteSelect]);
  
  // Handle column resize
  const handleResizeStart = useCallback((column: string, event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    setResizingColumn(column);
    setResizeStartX(event.clientX);
    setResizeStartWidth(columnWidths[column] || 120);
  }, [columnWidths]);
  
  const handleResizeMove = useCallback((event: React.MouseEvent) => {
    if (!resizingColumn) return;
    
    const diff = event.clientX - resizeStartX;
    const newWidth = Math.max(60, resizeStartWidth + diff);
    setColumnWidth(resizingColumn, newWidth);
  }, [resizingColumn, resizeStartX, resizeStartWidth, setColumnWidth]);
  
  const handleResizeEnd = useCallback(() => {
    setResizingColumn(null);
  }, []);
  
  // Render cell content
  const renderCell = useCallback((quote: Quote, column: string) => {
    switch (column) {
      case 'quoteNumber':
        return (
          <div className="font-medium text-gray-900">
            {quote.quoteNumber}
          </div>
        );
      
      case 'customerName':
        return (
          <div className="text-gray-900">
            {quote.customerName}
          </div>
        );
      
      case 'totalAmount':
        return (
          <div className="font-medium text-gray-900">
            {formatCurrency(quote.totalAmount)}
          </div>
        );
      
      case 'status':
        return (
          <QuoteStatusBadge 
            status={quote.status} 
            size="sm"
            variant="default"
          />
        );
      
      case 'createdAt':
        return (
          <div className="text-sm text-gray-600">
            {formatDate(quote.createdAt, 'short')}
          </div>
        );
      
      case 'updatedAt':
        return (
          <div className="text-sm text-gray-600">
            {formatDate(quote.updatedAt, 'short')}
          </div>
        );
      
      case 'expiryDate':
        return quote.expiryDate ? (
          <div className="text-sm text-gray-600">
            {formatDate(quote.expiryDate, 'short')}
          </div>
        ) : (
          <div className="text-sm text-gray-400">—</div>
        );
      
      default:
        return null;
    }
  }, []);
  
  return (
    <div 
      className={`overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      onMouseMove={resizingColumn ? handleResizeMove : undefined}
      onMouseUp={resizingColumn ? handleResizeEnd : undefined}
    >
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {/* Select all checkbox */}
            <th className="w-12 px-4 py-3 text-left">
              <input
                type="checkbox"
                checked={isAllSelected}
                ref={(el) => {
                  if (el) el.indeterminate = isIndeterminate;
                }}
                onChange={handleSelectAll}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
            </th>
            
            {/* Column headers */}
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 relative ${
                  column.sortable ? 'select-none' : ''
                }`}
                style={{ width: column.width }}
                onClick={column.sortable ? () => handleSort(column.key) : undefined}
              >
                <div className="flex items-center justify-between">
                  <span>{column.label}</span>
                  {column.sortable && (
                    <div className="flex flex-col ml-2">
                      <svg 
                        className={`w-3 h-3 ${
                          sortColumn === column.key && sortDirection === 'asc'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                      </svg>
                      <svg 
                        className={`w-3 h-3 -mt-1 ${
                          sortColumn === column.key && sortDirection === 'desc'
                            ? 'text-blue-600'
                            : 'text-gray-400'
                        }`}
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                
                {/* Column resize handle */}
                <div
                  className="absolute top-0 right-0 w-1 h-full cursor-col-resize hover:bg-blue-300"
                  onMouseDown={(e) => handleResizeStart(column.key, e)}
                />
              </th>
            ))}
            
            {/* Actions column */}
            <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        
        <tbody className="bg-white divide-y divide-gray-200">
          {sortedQuotes.map((quote) => {
            const isSelected = selectedQuotes.has(quote.id);
            
            return (
              <tr
                key={quote.id}
                className={`hover:bg-gray-50 cursor-pointer ${
                  isSelected ? 'bg-blue-50 border-blue-200' : ''
                }`}
                onClick={(e) => handleRowSelect(quote, e)}
              >
                {/* Selection checkbox */}
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    onClick={(e) => e.stopPropagation()}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </td>
                
                {/* Data cells */}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className="px-4 py-4 whitespace-nowrap text-sm"
                    style={{ width: column.width }}
                  >
                    {renderCell(quote, column.key)}
                  </td>
                ))}
                
                {/* Actions cell */}
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <button
                      className="text-gray-400 hover:text-blue-600 p-1.5 rounded-md hover:bg-blue-50 transition-colors"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewQuote?.(quote);
                      }}
                      title="View quote"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 616 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <QuoteActionsMenu
                      quote={quote}
                      onEdit={onEditQuote || (() => {})}
                      onDuplicate={onDuplicateQuote || (() => {})}
                      onConvert={onConvertQuote || (() => {})}
                      onArchive={onArchiveQuote || (() => {})}
                      onStatusChange={onStatusChange || (() => {})}
                      size="sm"
                      variant="subtle"
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      {/* Empty state */}
      {sortedQuotes.length === 0 && (
        <div className="text-center py-16">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No quotes found</h3>
          <p className="text-gray-500 mb-4">Get started by creating your first quote.</p>
          <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Quote
          </button>
        </div>
      )}
    </div>
  );
}