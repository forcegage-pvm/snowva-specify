import type { QuotesFilter } from '@/services/quotes/QuoteValidation';
import type { Quote } from '@/types/quotes/Quote';
import type { QuoteStatus } from '@/types/quotes/QuoteStatus';

/**
 * Quote filtering and search service
 * Handles client-side filtering, sorting, and search functionality
 */
export class QuoteFilterService {
  /**
   * Apply filters to quote list
   */
  static applyFilters(quotes: Quote[], filters: Partial<QuotesFilter>): Quote[] {
    let filteredQuotes = [...quotes];
    
    // Status filter
    if (filters.status && filters.status.length > 0) {
      filteredQuotes = filteredQuotes.filter(quote => 
        filters.status!.includes(quote.status)
      );
    }
    
    // Customer filter
    if (filters.customerId) {
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.customerId === filters.customerId
      );
    }
    
    // Date range filter
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.createdAt >= fromDate
      );
    }
    
    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filteredQuotes = filteredQuotes.filter(quote => 
        quote.createdAt <= toDate
      );
    }
    
    // Archived filter
    if (!filters.includeArchived) {
      filteredQuotes = filteredQuotes.filter(quote => !quote.isArchived);
    }
    
    // Text search
    if (filters.search) {
      filteredQuotes = this.searchQuotes(filteredQuotes, filters.search);
    }
    
    return filteredQuotes;
  }
  
  /**
   * Search quotes by text
   */
  static searchQuotes(quotes: Quote[], searchTerm: string): Quote[] {
    const term = searchTerm.toLowerCase().trim();
    
    if (!term) return quotes;
    
    return quotes.filter(quote => {
      // Search in quote number
      if (quote.quoteNumber.toLowerCase().includes(term)) return true;
      
      // Search in customer name
      if (quote.customerName.toLowerCase().includes(term)) return true;
      
      // Search in notes
      if (quote.notes?.toLowerCase().includes(term)) return true;
      
      // Search in terms
      if (quote.terms?.toLowerCase().includes(term)) return true;
      
      // Search in line item descriptions
      const hasMatchingLineItem = quote.lineItems.some(item => 
        item.description.toLowerCase().includes(term) ||
        item.notes?.toLowerCase().includes(term) ||
        item.category?.toLowerCase().includes(term)
      );
      
      if (hasMatchingLineItem) return true;
      
      // Search in total amount (convert to string for partial matches)
      const amountStr = quote.totalAmount.toString();
      if (amountStr.includes(term)) return true;
      
      return false;
    });
  }
  
  /**
   * Sort quotes by specified field
   */
  static sortQuotes(
    quotes: Quote[], 
    sortBy: keyof Quote = 'createdAt', 
    sortOrder: 'asc' | 'desc' = 'desc'
  ): Quote[] {
    return [...quotes].sort((a, b) => {
      let aVal: any = a[sortBy];
      let bVal: any = b[sortBy];
      
      // Handle Date objects
      if (aVal instanceof Date && bVal instanceof Date) {
        aVal = aVal.getTime();
        bVal = bVal.getTime();
      }
      
      // Handle strings (case-insensitive)
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }
      
      let comparison = 0;
      if (aVal > bVal) comparison = 1;
      if (aVal < bVal) comparison = -1;
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }
  
  /**
   * Paginate quotes
   */
  static paginateQuotes(
    quotes: Quote[], 
    page: number = 1, 
    pageSize: number = 25
  ): {
    quotes: Quote[];
    totalCount: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } {
    const totalCount = quotes.length;
    const totalPages = Math.ceil(totalCount / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    
    return {
      quotes: quotes.slice(startIndex, endIndex),
      totalCount,
      page,
      pageSize,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    };
  }
  
  /**
   * Apply complete filtering, sorting, and pagination
   */
  static processQuotes(
    quotes: Quote[],
    filters: Partial<QuotesFilter> = {}
  ) {
    // Apply filters
    let processedQuotes = this.applyFilters(quotes, filters);
    
    // Apply sorting
    if (filters.sort) {
      processedQuotes = this.sortQuotes(
        processedQuotes,
        filters.sort as keyof Quote,
        filters.sortOrder || 'desc'
      );
    }
    
    // Apply pagination
    return this.paginateQuotes(
      processedQuotes,
      filters.page || 1,
      filters.pageSize || 25
    );
  }
  
  /**
   * Get filter options from quote dataset
   */
  static getFilterOptions(quotes: Quote[]): {
    statuses: Array<{ value: QuoteStatus; label: string; count: number }>;
    customers: Array<{ id: string; name: string; count: number }>;
    dateRange: { earliest: Date; latest: Date } | null;
    currencies: Array<{ code: string; count: number }>;
  } {
    const statusCounts = new Map<QuoteStatus, number>();
    const customerCounts = new Map<string, { name: string; count: number }>();
    const currencyCounts = new Map<string, number>();
    let earliestDate: Date | null = null;
    let latestDate: Date | null = null;
    
    quotes.forEach(quote => {
      // Count statuses
      const currentStatusCount = statusCounts.get(quote.status) || 0;
      statusCounts.set(quote.status, currentStatusCount + 1);
      
      // Count customers
      const currentCustomerCount = customerCounts.get(quote.customerId)?.count || 0;
      customerCounts.set(quote.customerId, {
        name: quote.customerName,
        count: currentCustomerCount + 1
      });
      
      // Count currencies
      const currentCurrencyCount = currencyCounts.get(quote.currency) || 0;
      currencyCounts.set(quote.currency, currentCurrencyCount + 1);
      
      // Track date range
      if (!earliestDate || quote.createdAt < earliestDate) {
        earliestDate = quote.createdAt;
      }
      if (!latestDate || quote.createdAt > latestDate) {
        latestDate = quote.createdAt;
      }
    });
    
    return {
      statuses: Array.from(statusCounts.entries()).map(([status, count]) => ({
        value: status,
        label: status,
        count
      })),
      customers: Array.from(customerCounts.entries()).map(([id, data]) => ({
        id,
        name: data.name,
        count: data.count
      })),
      dateRange: earliestDate && latestDate ? { earliest: earliestDate, latest: latestDate } : null,
      currencies: Array.from(currencyCounts.entries()).map(([code, count]) => ({
        code,
        count
      }))
    };
  }
  
  /**
   * Create saved filter preset
   */
  static createFilterPreset(
    name: string,
    filters: Partial<QuotesFilter>
  ): QuoteFilterPreset {
    return {
      id: `preset-${Date.now()}`,
      name,
      filters,
      createdAt: new Date(),
      isDefault: false
    };
  }
  
  /**
   * Advanced search with multiple criteria
   */
  static advancedSearch(quotes: Quote[], criteria: AdvancedSearchCriteria): Quote[] {
    return quotes.filter(quote => {
      // Amount range
      if (criteria.amountFrom !== undefined && quote.totalAmount < criteria.amountFrom) {
        return false;
      }
      if (criteria.amountTo !== undefined && quote.totalAmount > criteria.amountTo) {
        return false;
      }
      
      // Line item count
      if (criteria.minLineItems !== undefined && quote.lineItems.length < criteria.minLineItems) {
        return false;
      }
      if (criteria.maxLineItems !== undefined && quote.lineItems.length > criteria.maxLineItems) {
        return false;
      }
      
      // Has discount
      if (criteria.hasDiscount !== undefined) {
        const hasDiscount = quote.lineItems.some(item => (item.discount || 0) > 0);
        if (criteria.hasDiscount !== hasDiscount) {
          return false;
        }
      }
      
      // Is expired
      if (criteria.isExpired !== undefined) {
        const isExpired = quote.expiryDate < new Date();
        if (criteria.isExpired !== isExpired) {
          return false;
        }
      }
      
      // Has linked invoice
      if (criteria.hasLinkedInvoice !== undefined) {
        const hasLinkedInvoice = !!quote.linkedInvoiceId;
        if (criteria.hasLinkedInvoice !== hasLinkedInvoice) {
          return false;
        }
      }
      
      // Created by user
      if (criteria.createdBy && quote.createdBy !== criteria.createdBy) {
        return false;
      }
      
      // Product/service categories
      if (criteria.categories && criteria.categories.length > 0) {
        const hasMatchingCategory = quote.lineItems.some(item =>
          item.category && criteria.categories!.includes(item.category)
        );
        if (!hasMatchingCategory) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Get quick filter options
   */
  static getQuickFilters(): Array<{
    id: string;
    label: string;
    filters: Partial<QuotesFilter>;
  }> {
    return [
      {
        id: 'recent',
        label: 'Recent (Last 7 Days)',
        filters: {
          dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'pending',
        label: 'Pending Approval',
        filters: {
          status: ['Pending' as QuoteStatus]
        }
      },
      {
        id: 'approved',
        label: 'Approved',
        filters: {
          status: ['Approved' as QuoteStatus]
        }
      },
      {
        id: 'expiring-soon',
        label: 'Expiring Soon (Next 7 Days)',
        filters: {
          dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }
      },
      {
        id: 'high-value',
        label: 'High Value (>£10,000)',
        filters: {} // Would need custom logic in advancedSearch
      }
    ];
  }
}

/**
 * Advanced search criteria interface
 */
export interface AdvancedSearchCriteria {
  amountFrom?: number;
  amountTo?: number;
  minLineItems?: number;
  maxLineItems?: number;
  hasDiscount?: boolean;
  isExpired?: boolean;
  hasLinkedInvoice?: boolean;
  createdBy?: string;
  categories?: string[];
}

/**
 * Filter preset interface
 */
export interface QuoteFilterPreset {
  id: string;
  name: string;
  filters: Partial<QuotesFilter>;
  createdAt: Date;
  isDefault: boolean;
}

export default QuoteFilterService;