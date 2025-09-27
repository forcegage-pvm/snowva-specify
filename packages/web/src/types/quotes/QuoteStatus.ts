/**
 * Quote status enumeration representing the workflow lifecycle
 */
export enum QuoteStatus {
  Draft = 'Draft',
  Pending = 'Pending', 
  Approved = 'Approved',
  Rejected = 'Rejected',
  Converted = 'Converted',
  Archived = 'Archived'
}

/**
 * Valid status transitions for business rules validation
 */
export const VALID_STATUS_TRANSITIONS: Record<QuoteStatus, QuoteStatus[]> = {
  [QuoteStatus.Draft]: [QuoteStatus.Pending, QuoteStatus.Archived],
  [QuoteStatus.Pending]: [QuoteStatus.Approved, QuoteStatus.Rejected, QuoteStatus.Draft, QuoteStatus.Archived],
  [QuoteStatus.Approved]: [QuoteStatus.Converted, QuoteStatus.Archived],
  [QuoteStatus.Rejected]: [QuoteStatus.Draft, QuoteStatus.Archived],
  [QuoteStatus.Converted]: [QuoteStatus.Archived],
  [QuoteStatus.Archived]: [] // No transitions from archived state
};

/**
 * Status change audit record
 */
export interface QuoteStatusChange {
  id: string;
  quoteId: string;
  fromStatus: QuoteStatus;
  toStatus: QuoteStatus;
  changedBy: string;
  changedAt: Date;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Status update request
 */
export interface StatusUpdateRequest {
  status: QuoteStatus;
  reason?: string;
  metadata?: Record<string, any>;
}

/**
 * Status badge configuration for UI display
 */
export interface StatusBadgeConfig {
  label: string;
  color: 'gray' | 'blue' | 'green' | 'red' | 'yellow' | 'purple';
  icon?: string;
}

/**
 * Status display configuration
 */
export const STATUS_CONFIG: Record<QuoteStatus, StatusBadgeConfig> = {
  [QuoteStatus.Draft]: {
    label: 'Draft',
    color: 'gray'
  },
  [QuoteStatus.Pending]: {
    label: 'Pending Review',
    color: 'blue'
  },
  [QuoteStatus.Approved]: {
    label: 'Approved',
    color: 'green'
  },
  [QuoteStatus.Rejected]: {
    label: 'Rejected', 
    color: 'red'
  },
  [QuoteStatus.Converted]: {
    label: 'Converted',
    color: 'purple'
  },
  [QuoteStatus.Archived]: {
    label: 'Archived',
    color: 'gray'
  }
};

/**
 * Utility functions for status management
 */
export class QuoteStatusUtils {
  /**
   * Check if status transition is valid
   */
  static canTransition(from: QuoteStatus, to: QuoteStatus): boolean {
    return VALID_STATUS_TRANSITIONS[from].includes(to);
  }

  /**
   * Get available transitions from current status
   */
  static getAvailableTransitions(currentStatus: QuoteStatus): QuoteStatus[] {
    return VALID_STATUS_TRANSITIONS[currentStatus];
  }

  /**
   * Check if quote can be edited based on status
   */
  static canEdit(status: QuoteStatus): boolean {
    return [QuoteStatus.Draft, QuoteStatus.Pending].includes(status);
  }

  /**
   * Check if quote can be converted to invoice
   */
  static canConvert(status: QuoteStatus): boolean {
    return status === QuoteStatus.Approved;
  }

  /**
   * Check if quote can be duplicated
   */
  static canDuplicate(status: QuoteStatus): boolean {
    return status !== QuoteStatus.Archived;
  }

  /**
   * Get status badge configuration
   */
  static getBadgeConfig(status: QuoteStatus): StatusBadgeConfig {
    return STATUS_CONFIG[status];
  }
}