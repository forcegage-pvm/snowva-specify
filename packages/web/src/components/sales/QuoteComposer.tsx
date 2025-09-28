/**
 * Quote Composer Component with Fast Refresh Optimization
 * Sprint 004.1 - Technical Debt Resolution
 * 
 * Addresses TD005: Fast Refresh optimization
 * Eliminates state causing full reloads, implements proper component patterns
 */

'use client';

import { QuoteErrorBoundary } from '@/components/common/ErrorBoundary';
import { LoadingButton, QuoteLoadingState, useLoadingState } from '@/components/common/LoadingStates';
import { CreateQuoteRequest, defaultQuoteService, type Quote } from '@/services/quote-service';
import { FileTextIcon, PlusIcon, SaveIcon, TrashIcon } from 'lucide-react';
import React, { memo, useCallback, useMemo, useState } from 'react';

interface QuoteComposerProps {
  customerId?: string;
  initialData?: Partial<CreateQuoteRequest>;
  onSave?: (quote: Quote) => void;
  onCancel?: () => void;
  className?: string;
}

interface QuoteItemFormData {
  description: string;
  quantity: number;
  unitPrice: number;
}

/**
 * Optimized Quote Item Component
 * Memoized to prevent unnecessary re-renders
 */
const QuoteItemRow = memo<{
  item: QuoteItemFormData;
  index: number;
  onUpdate: (index: number, item: QuoteItemFormData) => void;
  onRemove: (index: number) => void;
}>(({ item, index, onUpdate, onRemove }) => {
  // Use stable callbacks to prevent child re-renders
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onUpdate(index, { ...item, description: e.target.value });
  }, [index, item, onUpdate]);

  const handleQuantityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const quantity = parseFloat(e.target.value) || 0;
    onUpdate(index, { ...item, quantity });
  }, [index, item, onUpdate]);

  const handleUnitPriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const unitPrice = parseFloat(e.target.value) || 0;
    onUpdate(index, { ...item, unitPrice });
  }, [index, item, onUpdate]);

  const handleRemove = useCallback(() => {
    onRemove(index);
  }, [index, onRemove]);

  // Memoized total calculation
  const itemTotal = useMemo(() => {
    return (item.quantity * item.unitPrice).toFixed(2);
  }, [item.quantity, item.unitPrice]);

  return (
    <div className="grid grid-cols-12 gap-4 items-start bg-gray-50 p-4 rounded-lg">
      <div className="col-span-5">
        <label htmlFor={`item-${index}-description`} className="sr-only">
          Item {index + 1} Description
        </label>
        <input
          id={`item-${index}-description`}
          type="text"
          placeholder="Item description"
          value={item.description}
          onChange={handleDescriptionChange}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div className="col-span-2">
        <label htmlFor={`item-${index}-quantity`} className="sr-only">
          Item {index + 1} Quantity
        </label>
        <input
          id={`item-${index}-quantity`}
          type="number"
          placeholder="Qty"
          value={item.quantity || ''}
          onChange={handleQuantityChange}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div className="col-span-2">
        <label htmlFor={`item-${index}-price`} className="sr-only">
          Item {index + 1} Unit Price
        </label>
        <input
          id={`item-${index}-price`}
          type="number"
          placeholder="Price"
          value={item.unitPrice || ''}
          onChange={handleUnitPriceChange}
          min="0"
          step="0.01"
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          required
        />
      </div>
      
      <div className="col-span-2 text-right text-sm font-medium text-gray-700 py-2">
        ${itemTotal}
      </div>
      
      <div className="col-span-1 flex justify-end">
        <button
          type="button"
          onClick={handleRemove}
          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
          aria-label={`Remove item ${index + 1}`}
        >
          <TrashIcon className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
});

QuoteItemRow.displayName = 'QuoteItemRow';

/**
 * Quote Totals Component
 * Memoized for performance
 */
const QuoteTotals = memo<{
  items: QuoteItemFormData[];
  taxRate?: number;
}>(({ items, taxRate = 0.08 }) => {
  const totals = useMemo(() => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    return {
      subtotal: subtotal.toFixed(2),
      tax: tax.toFixed(2),
      total: total.toFixed(2),
    };
  }, [items, taxRate]);

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <div className="space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal:</span>
          <span className="font-medium">${totals.subtotal}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Tax ({(taxRate * 100).toFixed(1)}%):</span>
          <span className="font-medium">${totals.tax}</span>
        </div>
        <div className="border-t border-gray-200 pt-2">
          <div className="flex justify-between text-lg font-bold">
            <span>Total:</span>
            <span>${totals.total}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

QuoteTotals.displayName = 'QuoteTotals';

/**
 * Main Quote Composer Component
 * Optimized for Fast Refresh compatibility
 */
const QuoteComposer: React.FC<QuoteComposerProps> = ({
  customerId,
  initialData,
  onSave,
  onCancel,
  className = '',
}) => {
  // Stable initial state using useMemo
  const initialQuoteData = useMemo(() => ({
    title: initialData?.title || '',
    description: initialData?.description || '',
    customerId: customerId || initialData?.customerId || '',
    validUntil: initialData?.validUntil || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    items: initialData?.items?.map(item => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    })) || [{ description: '', quantity: 1, unitPrice: 0 }],
    metadata: initialData?.metadata || {},
  }), [customerId, initialData]);

  // Form state
  const [title, setTitle] = useState(initialQuoteData.title);
  const [description, setDescription] = useState(initialQuoteData.description);
  const [selectedCustomerId, setSelectedCustomerId] = useState(initialQuoteData.customerId);
  const [validUntil, setValidUntil] = useState(
    initialQuoteData.validUntil.toISOString().split('T')[0]
  );
  const [items, setItems] = useState<QuoteItemFormData[]>(initialQuoteData.items);

  // Loading state
  const { isLoading, startLoading, stopLoading } = useLoadingState();

  // Stable callback functions using useCallback
  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
  }, []);

  const handleCustomerIdChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedCustomerId(e.target.value);
  }, []);

  const handleValidUntilChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setValidUntil(e.target.value);
  }, []);

  const handleItemUpdate = useCallback((index: number, updatedItem: QuoteItemFormData) => {
    setItems(prevItems => {
      const newItems = [...prevItems];
      newItems[index] = updatedItem;
      return newItems;
    });
  }, []);

  const handleItemRemove = useCallback((index: number) => {
    setItems(prevItems => prevItems.filter((_, i) => i !== index));
  }, []);

  const handleAddItem = useCallback(() => {
    setItems(prevItems => [
      ...prevItems,
      { description: '', quantity: 1, unitPrice: 0 }
    ]);
  }, []);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !selectedCustomerId.trim() || items.length === 0) {
      return;
    }

    startLoading('Saving quote...');

    try {
      const quoteRequest: CreateQuoteRequest = {
        title: title.trim(),
        description: description.trim() || undefined,
        customerId: selectedCustomerId.trim(),
        items: items.filter(item => item.description.trim() !== ''),
        validUntil: new Date(validUntil),
        metadata: {},
      };

      const savedQuote = await defaultQuoteService.createQuote(quoteRequest);
      
      if (onSave) {
        onSave(savedQuote);
      }
    } catch (error) {
      console.error('Failed to save quote:', error);
      // Error will be handled by error boundary
      throw error;
    } finally {
      stopLoading();
    }
  }, [title, description, selectedCustomerId, validUntil, items, onSave, startLoading, stopLoading]);

  const handleCancel = useCallback(() => {
    if (onCancel) {
      onCancel();
    }
  }, [onCancel]);

  // Memoized validation state
  const isValid = useMemo(() => {
    return title.trim() !== '' && 
           selectedCustomerId.trim() !== '' && 
           items.some(item => item.description.trim() !== '');
  }, [title, selectedCustomerId, items]);

  // Show loading state if saving
  if (isLoading) {
    return <QuoteLoadingState operation="saving" className={className} />;
  }

  return (
    <QuoteErrorBoundary operation="create">
      <div className={`max-w-4xl mx-auto bg-white shadow-sm rounded-lg ${className}`}>
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center">
            <FileTextIcon className="h-6 w-6 text-blue-600 mr-3" />
            <h2 className="text-xl font-semibold text-gray-900">Create Quote</h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quote Header */}
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="quote-title" className="block text-sm font-medium text-gray-700 mb-2">
                Quote Title *
              </label>
              <input
                id="quote-title"
                type="text"
                value={title}
                onChange={handleTitleChange}
                placeholder="Enter quote title"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label htmlFor="customer-id" className="block text-sm font-medium text-gray-700 mb-2">
                Customer ID *
              </label>
              <input
                id="customer-id"
                type="text"
                value={selectedCustomerId}
                onChange={handleCustomerIdChange}
                placeholder="Enter customer ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <label htmlFor="quote-description" className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                id="quote-description"
                value={description}
                onChange={handleDescriptionChange}
                placeholder="Optional description"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label htmlFor="valid-until" className="block text-sm font-medium text-gray-700 mb-2">
                Valid Until *
              </label>
              <input
                id="valid-until"
                type="date"
                value={validUntil}
                onChange={handleValidUntilChange}
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Quote Items */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Quote Items</h3>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <PlusIcon className="h-4 w-4 mr-2" />
                Add Item
              </button>
            </div>

            <div className="space-y-4">
              {items.map((item, index) => (
                <QuoteItemRow
                  key={index}
                  item={item}
                  index={index}
                  onUpdate={handleItemUpdate}
                  onRemove={handleItemRemove}
                />
              ))}
            </div>
          </div>

          {/* Quote Totals */}
          {items.length > 0 && (
            <div className="max-w-md ml-auto">
              <QuoteTotals items={items} />
            </div>
          )}

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            {onCancel && (
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Cancel
              </button>
            )}
            
            <LoadingButton
              type="submit"
              loading={isLoading}
              disabled={!isValid}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              loadingText="Saving..."
            >
              <SaveIcon className="h-4 w-4 mr-2" />
              Save Quote
            </LoadingButton>
          </div>
        </form>
      </div>
    </QuoteErrorBoundary>
  );
};

// Export memoized component to prevent unnecessary re-renders
export default memo(QuoteComposer);