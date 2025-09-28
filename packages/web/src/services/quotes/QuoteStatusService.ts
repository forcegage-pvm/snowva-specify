import type { Quote } from '@/types/quotes/Quote';
import { QuoteStatus, QuoteStatusUtils, type QuoteStatusChange } from '@/types/quotes/QuoteStatus';

/**
 * Quote status management service
 * Handles status transitions, validation, and history tracking
 */
export class QuoteStatusService {
  /**
   * Update quote status with validation
   */
  static async updateStatus(
    quote: Quote,
    newStatus: QuoteStatus,
    changedBy: string,
    reason?: string,
    metadata?: Record<string, unknown>
  ): Promise<{
    success: boolean;
    updatedQuote?: Quote;
    error?: string;
  }> {
    try {
      // Validate transition
      if (!QuoteStatusUtils.canTransition(quote.status, newStatus)) {
        return {
          success: false,
          error: `Invalid status transition from ${quote.status} to ${newStatus}`
        };
      }
      
      // Create status change record
      const statusChange: QuoteStatusChange = {
        id: `status-${quote.id}-${Date.now()}`,
        quoteId: quote.id,
        fromStatus: quote.status,
        toStatus: newStatus,
        changedBy,
        changedAt: new Date(),
        reason,
        metadata
      };
      
      // Update quote
      const updatedQuote: Quote = {
        ...quote,
        status: newStatus,
        statusHistory: [...quote.statusHistory, statusChange],
        updatedAt: new Date(),
        lastModifiedBy: changedBy,
        version: quote.version + 1
      };
      
      return {
        success: true,
        updatedQuote
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
  
  /**
   * Get available transitions for current status
   */
  static getAvailableTransitions(currentStatus: QuoteStatus): QuoteStatus[] {
    return QuoteStatusUtils.getAvailableTransitions(currentStatus);
  }
  
  /**
   * Check if transition is allowed
   */
  static canTransition(fromStatus: QuoteStatus, toStatus: QuoteStatus): boolean {
    return QuoteStatusUtils.canTransition(fromStatus, toStatus);
  }
  
  /**
   * Get status history for a quote
   */
  static getStatusHistory(quote: Quote): QuoteStatusChange[] {
    return quote.statusHistory.sort((a, b) => 
      b.changedAt.getTime() - a.changedAt.getTime()
    );
  }
  
  /**
   * Get current status display info
   */
  static getStatusDisplay(status: QuoteStatus) {
    return QuoteStatusUtils.getBadgeConfig(status);
  }
  
  /**
   * Auto-expire quotes past their expiry date
   */
  static async checkExpiredQuotes(quotes: Quote[]): Promise<Quote[]> {
    const now = new Date();
    const expiredQuotes: Quote[] = [];
    
    for (const quote of quotes) {
      if (
        quote.expiryDate < now &&
        (quote.status === QuoteStatus.Draft || quote.status === QuoteStatus.Pending)
      ) {
        const result = await this.updateStatus(
          quote,
          QuoteStatus.Archived,
          'system',
          'Auto-expired due to expiry date'
        );
        
        if (result.success && result.updatedQuote) {
          expiredQuotes.push(result.updatedQuote);
        }
      }
    }
    
    return expiredQuotes;
  }
  
  /**
   * Bulk status update for multiple quotes
   */
  static async bulkStatusUpdate(
    quotes: Quote[],
    newStatus: QuoteStatus,
    changedBy: string,
    reason?: string
  ): Promise<{
    successful: Quote[];
    failed: Array<{ quote: Quote; error: string }>;
  }> {
    const successful: Quote[] = [];
    const failed: Array<{ quote: Quote; error: string }> = [];
    
    for (const quote of quotes) {
      const result = await this.updateStatus(quote, newStatus, changedBy, reason);
      
      if (result.success && result.updatedQuote) {
        successful.push(result.updatedQuote);
      } else {
        failed.push({
          quote,
          error: result.error || 'Unknown error'
        });
      }
    }
    
    return { successful, failed };
  }
  
  /**
   * Get status statistics for a set of quotes
   */
  static getStatusStatistics(quotes: Quote[]): {
    total: number;
    byStatus: Record<QuoteStatus, number>;
    percentages: Record<QuoteStatus, number>;
  } {
    const total = quotes.length;
    const byStatus = {} as Record<QuoteStatus, number>;
    
    // Initialize counts
    Object.values(QuoteStatus).forEach(status => {
      byStatus[status] = 0;
    });
    
    // Count quotes by status
    quotes.forEach(quote => {
      const status = quote.status as keyof typeof byStatus;
      byStatus[status]++;
    });
    
    // Calculate percentages
    const percentages = {} as Record<QuoteStatus, number>;
    Object.entries(byStatus).forEach(([status, count]) => {
      percentages[status as QuoteStatus] = total > 0 ? (count / total) * 100 : 0;
    });
    
    return {
      total,
      byStatus,
      percentages
    };
  }
  
  /**
   * Get quotes requiring attention
   */
  static getQuotesRequiringAttention(quotes: Quote[]): {
    expiringSoon: Quote[]; // Expiring within 7 days
    pendingLong: Quote[]; // Pending for more than 14 days
    readyToConvert: Quote[]; // Approved quotes without invoice
  } {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    
    const expiringSoon = quotes.filter(quote => 
      quote.expiryDate <= sevenDaysFromNow &&
      quote.expiryDate > now &&
      (quote.status === QuoteStatus.Draft || quote.status === QuoteStatus.Pending)
    );
    
    const pendingLong = quotes.filter(quote =>
      quote.status === QuoteStatus.Pending &&
      quote.createdAt < fourteenDaysAgo
    );
    
    const readyToConvert = quotes.filter(quote =>
      quote.status === QuoteStatus.Approved &&
      !quote.linkedInvoiceId
    );
    
    return {
      expiringSoon,
      pendingLong,
      readyToConvert
    };
  }
  
  /**
   * Validate status change business rules
   */
  static validateStatusChange(
    quote: Quote,
    newStatus: QuoteStatus,
    metadata?: Record<string, unknown>
  ): {
    valid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // Check basic transition validity
    if (!this.canTransition(quote.status, newStatus)) {
      errors.push(`Cannot transition from ${quote.status} to ${newStatus}`);
    }
    
    // Additional business rule validations
    if (newStatus === QuoteStatus.Approved) {
      if (quote.totalAmount <= 0) {
        errors.push('Cannot approve quote with zero or negative total');
      }
      
      if (quote.lineItems.length === 0) {
        errors.push('Cannot approve quote without line items');
      }
    }
    
    if (newStatus === QuoteStatus.Converted) {
      if (quote.status !== QuoteStatus.Approved) {
        errors.push('Quote must be approved before conversion');
      }
      
      if (!metadata?.invoiceId) {
        warnings.push('Converting without linked invoice ID');
      }
    }
    
    // Check expiry date
    if (
      (newStatus === QuoteStatus.Pending || newStatus === QuoteStatus.Approved) &&
      quote.expiryDate < new Date()
    ) {
      warnings.push('Quote is past its expiry date');
    }
    
    return {
      valid: errors.length === 0,
      warnings,
      errors
    };
  }
}

export default QuoteStatusService;