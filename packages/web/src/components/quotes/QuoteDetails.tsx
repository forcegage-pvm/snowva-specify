'use client';

import { formatCurrency, formatDate } from '@/lib/utils/format';
import { Quote } from '@/types/quotes/Quote';
import { QuoteStatus, STATUS_CONFIG, VALID_STATUS_TRANSITIONS } from '@/types/quotes/QuoteStatus';
import { useCallback, useState } from 'react';

// Inline utility functions
function getStatusLabel(status: QuoteStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}

function getStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: 'bg-yellow-100 text-yellow-800',
    [QuoteStatus.Pending]: 'bg-blue-100 text-blue-800',
    [QuoteStatus.Approved]: 'bg-green-100 text-green-800',
    [QuoteStatus.Rejected]: 'bg-red-100 text-red-800',
    [QuoteStatus.Expired]: 'bg-orange-100 text-orange-800',
    [QuoteStatus.Converted]: 'bg-purple-100 text-purple-800',
    [QuoteStatus.Archived]: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

function getValidNextStatuses(status: QuoteStatus): QuoteStatus[] {
  return VALID_STATUS_TRANSITIONS[status] || [];
}

interface QuoteDetailsProps {
  quote: Quote;
  onStatusChange?: (status: QuoteStatus) => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onExport?: (format: 'pdf' | 'excel') => void;
  className?: string;
}

/**
 * Detailed view component for displaying individual quote information
 */
export function QuoteDetails({
  quote,
  onStatusChange,
  onEdit,
  onDuplicate,
  onDelete,
  onExport,
  className = ''
}: QuoteDetailsProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'lineitems' | 'history'>('details');
  const [showStatusMenu, setShowStatusMenu] = useState(false);
  
  // Get available status transitions
  const validNextStatuses = getValidNextStatuses(quote.status);
  
  const handleStatusChange = useCallback((newStatus: QuoteStatus) => {
    if (onStatusChange) {
      onStatusChange(newStatus);
    }
    setShowStatusMenu(false);
  }, [onStatusChange]);
  
  const statusColor = getStatusColor(quote.status);
  const statusLabel = getStatusLabel(quote.status);
  
  return (
    <div className={`bg-white border rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-2xl font-bold text-gray-900">
                {quote.quoteNumber}
              </h1>
              <div className="relative">
                <button
                  onClick={() => setShowStatusMenu(!showStatusMenu)}
                  className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusColor} hover:opacity-80 transition-opacity`}
                >
                  {statusLabel}
                  {validNextStatuses.length > 0 && (
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
                
                {/* Status change dropdown */}
                {showStatusMenu && validNextStatuses.length > 0 && (
                  <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                    <div className="py-1">
                      {validNextStatuses.map((status) => (
                        <button
                          key={status}
                          onClick={() => handleStatusChange(status)}
                          className="block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                        >
                          Change to {getStatusLabel(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="mt-1 text-lg text-gray-600">{quote.customerName}</p>
            <div className="mt-2 text-sm text-gray-500 space-y-1">
              <div>Created: {formatDate(quote.createdAt, 'medium')}</div>
              <div>Updated: {formatDate(quote.updatedAt, 'medium')}</div>
              {quote.expiryDate && (
                <div>Expires: {formatDate(quote.expiryDate, 'medium')}</div>
              )}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(quote.totalAmount)}
              </div>
              <div className="text-sm text-gray-500">
                {quote.currency}
              </div>
            </div>
            
            {/* Action menu */}
            <div className="flex items-center space-x-1 ml-4">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
                  title="Edit quote"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              )}
              
              {onDuplicate && (
                <button
                  onClick={onDuplicate}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
                  title="Duplicate quote"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              )}
              
              {onExport && (
                <div className="relative">
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-50"
                    title="Export quote"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </button>
                </div>
              )}
              
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50"
                  title="Delete quote"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('details')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'details'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Details
            </button>
            <button
              onClick={() => setActiveTab('lineitems')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lineitems'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Line Items ({quote.lineItems?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'history'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              History
            </button>
          </nav>
        </div>
      </div>
      
      {/* Content */}
      <div className="px-6 py-6">
        {activeTab === 'details' && (
          <div className="space-y-6">
            {/* Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Subtotal</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(quote.subtotal)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Tax ({(quote.taxRate * 100).toFixed(1)}%)</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(quote.taxAmount)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Total</div>
                <div className="text-lg font-semibold text-gray-900">
                  {formatCurrency(quote.totalAmount)}
                </div>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="text-sm font-medium text-gray-500">Currency</div>
                <div className="text-lg font-semibold text-gray-900">
                  {quote.currency}
                </div>
              </div>
            </div>
            
            {/* Customer Information */}
            <div className="border rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div className="text-sm font-medium text-gray-500">Name</div>
                  <div className="text-base text-gray-900">{quote.customerName}</div>
                </div>
                <div>
                  <div className="text-sm font-medium text-gray-500">Customer ID</div>
                  <div className="text-base text-gray-900">{quote.customerId}</div>
                </div>
              </div>
            </div>
            
            {/* Terms and Notes */}
            {(quote.terms || quote.notes) && (
              <div className="border rounded-lg p-4">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
                <div className="space-y-4">
                  {quote.terms && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Terms & Conditions</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{quote.terms}</div>
                    </div>
                  )}
                  {quote.notes && (
                    <div>
                      <div className="text-sm font-medium text-gray-500 mb-2">Notes</div>
                      <div className="text-sm text-gray-900 whitespace-pre-wrap">{quote.notes}</div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'lineitems' && (
          <div className="space-y-4">
            {quote.lineItems && quote.lineItems.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Unit Price
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {quote.lineItems.map((item, index) => (
                      <tr key={item.id || index}>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          <div className="font-medium">{item.description}</div>
                          {item.notes && (
                            <div className="text-xs text-gray-500 mt-1">{item.notes}</div>
                          )}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {item.quantity}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-900">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="px-4 py-4 text-sm font-medium text-gray-900">
                          {formatCurrency(item.totalPrice || item.total)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No line items added yet.
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'history' && (
          <div className="space-y-4">
            {quote.statusHistory && quote.statusHistory.length > 0 ? (
              <div className="space-y-4">
                {quote.statusHistory.map((entry, index) => (
                  <div key={entry.id || index} className="flex items-start space-x-3 p-4 border rounded-lg">
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-gray-900">
                          Status changed from {getStatusLabel(entry.fromStatus)} to {getStatusLabel(entry.toStatus)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(entry.changedAt, 'medium')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        by {entry.changedBy}
                      </div>
                      {entry.reason && (
                        <div className="text-sm text-gray-500 mt-2">
                          {entry.reason}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No status history available.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}