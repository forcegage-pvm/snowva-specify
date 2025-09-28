'use client';

import { Quote } from '@/types/quotes/Quote';
import { QuoteStatus } from '@/types/quotes/QuoteStatus';
import {
    Archive,
    Copy,
    FileText,
    MoreHorizontal,
    Pencil,
    RefreshCcw
} from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface QuoteActionsMenuProps {
  quote: Quote;
  onEdit: (quote: Quote) => void;
  onDuplicate: (quote: Quote) => void;
  onConvert: (quote: Quote) => void;
  onArchive: (quote: Quote) => void;
  onStatusChange: (quote: Quote) => void;
  showStatusActions?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'subtle' | 'minimal';
}

/**
 * Dropdown menu component for quote actions (Edit, Duplicate, Convert, Archive)
 * Follows constitutional principles: Component-First, Accessibility-First, Test-First
 */
export function QuoteActionsMenu({
  quote,
  onEdit,
  onDuplicate,
  onConvert,
  onArchive,
  onStatusChange,
  showStatusActions = false,
  disabled = false,
  size = 'md',
  variant = 'default'
}: QuoteActionsMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Generate unique IDs for ARIA attributes
  const triggerId = `quote-actions-trigger-${quote.id}`;
  const menuId = `quote-actions-menu-${quote.id}`;

  // Handle click outside to close menu
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  // Handle keyboard navigation in menu
  const handleMenuKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) return;

    const menuItems = menuRef.current?.querySelectorAll('[role="menuitem"]:not([aria-disabled="true"])');
    if (!menuItems) return;

    const currentIndex = Array.from(menuItems).findIndex(item => item === document.activeElement);

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        const nextIndex = currentIndex < menuItems.length - 1 ? currentIndex + 1 : 0;
        (menuItems[nextIndex] as HTMLElement).focus();
        break;
      case 'ArrowUp':
        event.preventDefault();
        const prevIndex = currentIndex > 0 ? currentIndex - 1 : menuItems.length - 1;
        (menuItems[prevIndex] as HTMLElement).focus();
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        (document.activeElement as HTMLElement)?.click();
        break;
    }
  }, [isOpen]);

  // Toggle menu visibility
  const toggleMenu = useCallback(() => {
    if (disabled) return;
    setIsOpen(prev => !prev);
  }, [disabled]);

  // Action handlers
  const handleEdit = useCallback(() => {
    setIsOpen(false);
    onEdit(quote);
  }, [quote, onEdit]);

  const handleDuplicate = useCallback(() => {
    setIsOpen(false);
    onDuplicate(quote);
  }, [quote, onDuplicate]);

  const handleConvert = useCallback(() => {
    if (quote.status === QuoteStatus.Converted) return;
    setIsOpen(false);
    onConvert(quote);
  }, [quote, onConvert]);

  const handleArchive = useCallback(() => {
    if (quote.status === QuoteStatus.Archived) return;
    setIsOpen(false);
    onArchive(quote);
  }, [quote, onArchive]);

  const handleStatusChange = useCallback(() => {
    setIsOpen(false);
    onStatusChange(quote);
  }, [quote, onStatusChange]);

  // Check if actions are disabled based on quote status
  const canConvert = quote.status !== QuoteStatus.Converted;
  const canArchive = quote.status !== QuoteStatus.Archived;
  const canEdit = quote.status !== QuoteStatus.Archived;

  // Size and variant classes
  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return 'h-6 w-6 p-1';
      case 'lg':
        return 'h-10 w-10 p-2';
      default:
        return 'h-8 w-8 p-1.5';
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'subtle':
        return 'text-gray-400 hover:text-gray-600 hover:bg-gray-50';
      case 'minimal':
        return 'text-gray-300 hover:text-gray-500';
      default:
        return 'text-gray-600 hover:text-gray-900 hover:bg-gray-100';
    }
  };

  return (
    <div className="relative inline-block" ref={menuRef}>
      {/* Trigger Button */}
      <button
        ref={triggerRef}
        id={triggerId}
        onClick={toggleMenu}
        disabled={disabled}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="More actions"
        className={`
          inline-flex items-center justify-center rounded-md transition-colors
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          disabled:opacity-50 disabled:cursor-not-allowed
          ${getSizeClasses()}
          ${getVariantClasses()}
        `}
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div
          id={menuId}
          role="menu"
          aria-labelledby={triggerId}
          onKeyDown={handleMenuKeyDown}
          className="absolute right-0 z-50 mt-1 w-56 origin-top-right bg-white border border-gray-200 rounded-md shadow-lg focus:outline-none"
        >
          <div className="py-1">
            {/* Edit Quote */}
            <button
              role="menuitem"
              onClick={handleEdit}
              disabled={!canEdit}
              aria-disabled={!canEdit}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Pencil className="h-4 w-4 mr-3" />
              Edit Quote
            </button>

            {/* Duplicate Quote */}
            <button
              role="menuitem"
              onClick={handleDuplicate}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Copy className="h-4 w-4 mr-3" />
              Duplicate Quote
            </button>

            <div className="border-t border-gray-100 my-1" />

            {/* Convert to Invoice */}
            <button
              role="menuitem"
              onClick={handleConvert}
              disabled={!canConvert}
              aria-disabled={!canConvert}
              className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <FileText className="h-4 w-4 mr-3" />
              Convert to Invoice
            </button>

            {/* Status Change Actions */}
            {showStatusActions && (
              <button
                role="menuitem"
                onClick={handleStatusChange}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <RefreshCcw className="h-4 w-4 mr-3" />
                Change Status
              </button>
            )}

            <div className="border-t border-gray-100 my-1" />

            {/* Archive Quote */}
            <button
              role="menuitem"
              onClick={handleArchive}
              disabled={!canArchive}
              aria-disabled={!canArchive}
              className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Archive className="h-4 w-4 mr-3" />
              Archive Quote
            </button>
          </div>
        </div>
      )}
    </div>
  );
}