import { QuoteStatus } from '@/types/quotes/QuoteStatus';

/**
 * Utility functions for quote status handling
 */

/**
 * Get the display label for a quote status
 */
export function getStatusLabel(status: QuoteStatus): string {
  const labels: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: 'Draft',
    [QuoteStatus.Pending]: 'Pending',
    [QuoteStatus.Approved]: 'Approved',
    [QuoteStatus.Rejected]: 'Rejected',
    [QuoteStatus.Converted]: 'Converted',
    [QuoteStatus.Archived]: 'Archived'
  };
  
  return labels[status] || status;
}

/**
 * Get the color classes for a quote status badge
 */
export function getStatusColor(status: QuoteStatus): string {
  const colors: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: 'bg-gray-100 text-gray-800',
    [QuoteStatus.Pending]: 'bg-yellow-100 text-yellow-800',
    [QuoteStatus.Approved]: 'bg-green-100 text-green-800',
    [QuoteStatus.Rejected]: 'bg-red-100 text-red-800',
    [QuoteStatus.Converted]: 'bg-blue-100 text-blue-800',
    [QuoteStatus.Archived]: 'bg-gray-100 text-gray-800'
  };
  
  return colors[status] || 'bg-gray-100 text-gray-800';
}

/**
 * Get the icon for a quote status
 */
export function getStatusIcon(status: QuoteStatus): string {
  const icons: Record<QuoteStatus, string> = {
    [QuoteStatus.Draft]: '📝',
    [QuoteStatus.Pending]: '👀',
    [QuoteStatus.Approved]: '✅',
    [QuoteStatus.Rejected]: '❌',
    [QuoteStatus.Converted]: '🔄',
    [QuoteStatus.Archived]: '�'
  };
  
  return icons[status] || '📄';
}

/**
 * Check if a status indicates the quote is active/actionable
 */
export function isActiveStatus(status: QuoteStatus): boolean {
  return [
    QuoteStatus.Draft,
    QuoteStatus.Pending
  ].includes(status);
}

/**
 * Check if a status indicates the quote is completed
 */
export function isCompletedStatus(status: QuoteStatus): boolean {
  return [
    QuoteStatus.Approved,
    QuoteStatus.Rejected,
    QuoteStatus.Converted,
    QuoteStatus.Archived
  ].includes(status);
}

/**
 * Get valid next statuses for a given status
 */
export function getValidNextStatuses(status: QuoteStatus): QuoteStatus[] {
  const transitions: Record<QuoteStatus, QuoteStatus[]> = {
    [QuoteStatus.Draft]: [QuoteStatus.Pending, QuoteStatus.Archived],
    [QuoteStatus.Pending]: [QuoteStatus.Approved, QuoteStatus.Rejected, QuoteStatus.Draft, QuoteStatus.Archived],
    [QuoteStatus.Approved]: [QuoteStatus.Converted, QuoteStatus.Archived],
    [QuoteStatus.Rejected]: [QuoteStatus.Draft, QuoteStatus.Archived],
    [QuoteStatus.Converted]: [QuoteStatus.Archived],
    [QuoteStatus.Archived]: []
  };
  
  return transitions[status] || [];
}

/**
 * Check if a status transition is valid
 */
export function isValidStatusTransition(
  fromStatus: QuoteStatus,
  toStatus: QuoteStatus
): boolean {
  const validNextStatuses = getValidNextStatuses(fromStatus);
  return validNextStatuses.includes(toStatus);
}

/**
 * Get status priority for sorting (lower number = higher priority)
 */
export function getStatusPriority(status: QuoteStatus): number {
  const priorities: Record<QuoteStatus, number> = {
    [QuoteStatus.Pending]: 1,
    [QuoteStatus.Draft]: 2,
    [QuoteStatus.Approved]: 3,
    [QuoteStatus.Converted]: 4,
    [QuoteStatus.Rejected]: 5,
    [QuoteStatus.Archived]: 6
  };
  
  return priorities[status] || 9;
}