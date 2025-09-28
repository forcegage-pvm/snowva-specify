'use client';

import { cn } from '@/lib/utils';
import { QuoteStatus, STATUS_CONFIG } from '@/types/quotes/QuoteStatus';

// Simple utility functions since we removed the quote-status.ts file
function getStatusLabel(status: QuoteStatus): string {
  return STATUS_CONFIG[status]?.label || status;
}

function getStatusIcon(status: QuoteStatus): string {
  const icons: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: '📝',
    [QuoteStatus.Pending]: '⏳',
    [QuoteStatus.Approved]: '✅',
    [QuoteStatus.Rejected]: '❌',
    [QuoteStatus.Expired]: '⏰',
    [QuoteStatus.Converted]: '💰',
    [QuoteStatus.Archived]: '📁'
  };
  return icons[status] || '📄';
}

function getStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: 'bg-gray-100 text-gray-800',
    [QuoteStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [QuoteStatus.Approved]: 'bg-green-100 text-green-800',
    [QuoteStatus.Rejected]: 'bg-red-100 text-red-800',
    [QuoteStatus.Expired]: 'bg-orange-100 text-orange-800',
    [QuoteStatus.Converted]: 'bg-purple-100 text-purple-800',
    [QuoteStatus.Archived]: 'bg-gray-100 text-gray-800'
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
}

interface QuoteStatusBadgeProps {
  /** Quote status to display */
  status: QuoteStatus;
  /** Optional additional CSS classes */
  className?: string;
  /** Show icon alongside status text */
  showIcon?: boolean;
  /** Size variant of the badge */
  size?: 'sm' | 'md' | 'lg';
  /** Badge style variant */
  variant?: 'default' | 'outline' | 'solid';
}

/**
 * QuoteStatusBadge Component
 * 
 * Displays a styled badge showing the current status of a quote.
 * Supports all quote workflow states with appropriate colors and icons.
 * 
 * @example
 * ```tsx
 * <QuoteStatusBadge status={QuoteStatus.Pending} />
 * <QuoteStatusBadge status={QuoteStatus.Approved} showIcon size="lg" />
 * ```
 */
export function QuoteStatusBadge({
  status,
  className = '',
  showIcon = true,
  size = 'md',
  variant = 'default'
}: QuoteStatusBadgeProps) {
  const label = getStatusLabel(status);
  const icon = getStatusIcon(status);
  const colorClasses = getStatusColor(status);

  // Size-based styling
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base'
  };

  // Variant-based styling
  const variantClasses = {
    default: colorClasses,
    outline: getOutlineColorClasses(status),
    solid: getSolidColorClasses(status)
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full font-medium',
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
      role="status"
      aria-label={`Quote status: ${label}`}
      data-testid={`quote-status-badge-${status.toLowerCase()}`}
    >
      {showIcon && (
        <span 
          className="mr-1" 
          aria-hidden="true"
          data-testid="status-icon"
        >
          {icon}
        </span>
      )}
      <span data-testid="status-label">{label}</span>
    </span>
  );
}

/**
 * Get outline variant color classes for status
 */
function getOutlineColorClasses(status: QuoteStatus): string {
  const outlineColors: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: 'border border-gray-300 text-gray-700 bg-white',
    [QuoteStatus.Pending]: 'border border-yellow-300 text-yellow-700 bg-yellow-50',
    [QuoteStatus.Approved]: 'border border-green-300 text-green-700 bg-green-50',
    [QuoteStatus.Rejected]: 'border border-red-300 text-red-700 bg-red-50',
    [QuoteStatus.Expired]: 'border border-orange-300 text-orange-700 bg-orange-50',
    [QuoteStatus.Converted]: 'border border-blue-300 text-blue-700 bg-blue-50',
    [QuoteStatus.Archived]: 'border border-gray-300 text-gray-600 bg-gray-50'
  };
  
  return outlineColors[status] || 'border border-gray-300 text-gray-700 bg-white';
}

/**
 * Get solid variant color classes for status
 */
function getSolidColorClasses(status: QuoteStatus): string {
  const solidColors: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: 'bg-gray-600 text-white',
    [QuoteStatus.Pending]: 'bg-yellow-600 text-white',
    [QuoteStatus.Approved]: 'bg-green-600 text-white',
    [QuoteStatus.Rejected]: 'bg-red-600 text-white',
    [QuoteStatus.Expired]: 'bg-orange-600 text-white',
    [QuoteStatus.Converted]: 'bg-blue-600 text-white',
    [QuoteStatus.Archived]: 'bg-gray-500 text-white'
  };
  
  return solidColors[status] || 'bg-gray-600 text-white';
}

// Export types for external use
export type { QuoteStatusBadgeProps };
