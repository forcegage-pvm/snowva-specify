'use client';

import { Quote } from '@/types/quotes/Quote';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import { Mail, Printer, X } from 'lucide-react';
import React, { useEffect, useRef } from 'react';

interface QuoteDetailModalProps {
  quote?: Quote;
  open: boolean;
  onClose: () => void;
  onPrint: (quote: Quote) => void;
  onEmail: (quote: Quote) => void;
  loading?: boolean;
  error?: string;
}

/**
 * Modal component for displaying detailed quote information
 * Follows constitutional principles: Component-First, Accessibility-First
 */
export function QuoteDetailModal({
  quote,
  open,
  onClose,
  onPrint,
  onEmail,
  loading = false,
  error
}: QuoteDetailModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const printButtonRef = useRef<HTMLButtonElement>(null);
  const emailButtonRef = useRef<HTMLButtonElement>(null);

  // Handle ESC key press and focus management
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && open) {
        onClose();
      }
    };

    const handleTab = (event: KeyboardEvent) => {
      if (!open || event.key !== 'Tab') return;
      
      const focusableElements = [
        closeButtonRef.current,
        emailButtonRef.current,
        printButtonRef.current
      ].filter(Boolean) as HTMLElement[];
      
      const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
      
      if (event.shiftKey) {
        // Shift+Tab - go to previous element
        const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
        focusableElements[prevIndex]?.focus();
      } else {
        // Tab - go to next element
        const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
        focusableElements[nextIndex]?.focus();
      }
      
      event.preventDefault();
    };

    if (open) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('keydown', handleTab);
      // Focus trap - focus the close button when modal opens
      closeButtonRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('keydown', handleTab);
    };
  }, [open, onClose]);

  // Handle click outside modal
  const handleBackdropClick = (event: React.MouseEvent) => {
    if (event.target === event.currentTarget) {
      onClose();
    }
  };

  // Format currency from cents to display format
  const formatCurrency = (amountInCents: number): string => {
    return `R ${(amountInCents / 100).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Format status for display
  const getStatusDisplayName = (status: QuoteStatus): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  // Get status badge color
  const getStatusBadgeColor = (status: QuoteStatus): string => {
    switch (status) {
      case QuoteStatus.Draft:
        return 'bg-gray-100 text-gray-800';
      case QuoteStatus.Pending:
        return 'bg-yellow-100 text-yellow-800';
      case QuoteStatus.Approved:
        return 'bg-green-100 text-green-800';
      case QuoteStatus.Rejected:
        return 'bg-red-100 text-red-800';
      case QuoteStatus.Converted:
        return 'bg-blue-100 text-blue-800';
      case QuoteStatus.Archived:
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (!open) {
    return null;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={handleBackdropClick}
      role="presentation"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-detail-title"
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 id="quote-detail-title" className="text-xl font-semibold text-gray-900">
            Quote Details
          </h2>
          <button
            ref={closeButtonRef}
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          {loading && (
            <div className="flex items-center justify-center p-8">
              <div role="status" aria-label="Loading quote details">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <span className="sr-only">Loading quote details...</span>
              </div>
            </div>
          )}

          {error && (
            <div className="p-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-800">{error}</p>
                <button 
                  className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {quote && !loading && !error && (
            <div className="p-6">
              {/* Quote Header */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {quote.quoteNumber}
                  </h3>
                  <p className="text-gray-600">{quote.customerName}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">
                    {formatCurrency(quote.totalAmount)}
                  </p>
                </div>
                <div className="flex flex-col items-start md:items-end">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusBadgeColor(quote.status)}`}>
                    {getStatusDisplayName(quote.status)}
                  </span>
                  <p className="text-sm text-gray-600 mt-2">
                    Created: {quote.createdAt.toLocaleDateString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Expires: {quote.expiryDate.toLocaleDateString()}
                  </p>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Line Items</h4>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {quote.lineItems.map((item) => (
                        <tr key={item.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                            {item.productId && (
                              <span className="text-xs text-gray-500 block">
                                Product ID: {item.productId}
                              </span>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.unitPrice)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatCurrency(item.totalPrice)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Totals */}
              <div className="mb-6 border-t border-gray-200 pt-4">
                <div className="flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">Subtotal:</span>
                      <span className="text-gray-900">{formatCurrency(quote.subtotal)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-gray-600">VAT (15%):</span>
                      <span className="text-gray-900">{formatCurrency(quote.taxAmount)}</span>
                    </div>
                    <div className="flex justify-between py-2 font-bold text-lg border-t border-gray-200">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">{formatCurrency(quote.totalAmount)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {quote.notes && (
                <div className="mb-6">
                  <h4 className="text-lg font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">{quote.notes}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        {quote && !loading && !error && (
          <div className="flex items-center justify-end p-6 border-t border-gray-200 space-x-3">
            <button
              ref={emailButtonRef}
              onClick={() => onEmail(quote)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Mail className="h-4 w-4 mr-2" />
              Email Quote
            </button>
            <button
              ref={printButtonRef}
              onClick={() => onPrint(quote)}
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-sm font-medium rounded-md text-white hover:bg-blue-700"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
}